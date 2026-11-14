import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList,
  Image, ScrollView, Alert, SafeAreaView, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const INITIAL_USERS = [
  {
    id: 'admin-1',
    email: 'eordonezc11@miumg.edu.gt',
    password: 'admin123',
    role: 'Administrador',
    nombre: 'Adriana Cruz'
  }
];

const INITIAL_EQUIPOS = [
  {
    id: 'eq-1',
    nombre: 'Osciloscopio Digital Tektronix',
    descripcion: '100 MHz, 2 canales, ideal para análisis de señales en electrónica.',
    imagen: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    disponible: true
  },
  {
    id: 'eq-2',
    nombre: 'Kit Arduino Mega 2560',
    descripcion: 'Incluye protoboard, sensores ultrasónicos, servos y cables jumper.',
    imagen: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400',
    disponible: true
  },
  {
    id: 'eq-3',
    nombre: 'Multímetro Fluke 117',
    descripcion: 'Multímetro digital True-RMS para mediciones eléctricas de precisión.',
    imagen: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400',
    disponible: true
  },
  {
    id: 'eq-4',
    nombre: 'Fuente de Poder DC Regulable',
    descripcion: '0-30V / 0-5A con pantalla digital LED.',
    imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    disponible: true
  }
];

export default function App() {
  const [users, setUsers] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [loginRoleTab, setLoginRoleTab] = useState('Estudiante');
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('catalogo');
  const [adminTab, setAdminTab] = useState('solicitudes');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [carrera, setCarrera] = useState('Ingeniería en Sistemas');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('@users');
      const storedEquipos = await AsyncStorage.getItem('@equipos');
      const storedPrestamos = await AsyncStorage.getItem('@prestamos');

      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        const sinAdminViejo = parsedUsers.filter((u) => u.role !== 'Administrador');
        const listaActualizada = [...INITIAL_USERS, ...sinAdminViejo];
        setUsers(listaActualizada);
        await AsyncStorage.setItem('@users', JSON.stringify(listaActualizada));
      } else {
        setUsers(INITIAL_USERS);
        await AsyncStorage.setItem('@users', JSON.stringify(INITIAL_USERS));
      }

      if (storedEquipos) {
        setEquipos(JSON.parse(storedEquipos));
      } else {
        setEquipos(INITIAL_EQUIPOS);
        await AsyncStorage.setItem('@equipos', JSON.stringify(INITIAL_EQUIPOS));
      }

      if (storedPrestamos) {
        setPrestamos(JSON.parse(storedPrestamos));
      }
    } catch (e) {
      console.error('Error cargando datos:', e);
    }
  };

  const saveUsers = async (newUsers) => {
    setUsers(newUsers);
    await AsyncStorage.setItem('@users', JSON.stringify(newUsers));
  };

  const saveEquipos = async (newEquipos) => {
    setEquipos(newEquipos);
    await AsyncStorage.setItem('@equipos', JSON.stringify(newEquipos));
  };

  const savePrestamos = async (newPrestamos) => {
    setPrestamos(newPrestamos);
    await AsyncStorage.setItem('@prestamos', JSON.stringify(newPrestamos));
  };

  const handleSelectRoleTab = (role) => {
    setLoginRoleTab(role);
    setAuthMode('login');
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  const handleLogin = () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Ingresa tu correo y contraseña.');
      return;
    }

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password &&
        u.role === loginRoleTab
    );

    if (!found) {
      setErrorMsg(`Credenciales incorrectas para ${loginRoleTab}.`);
      return;
    }

    setCurrentUser(found);
    setEmail('');
    setPassword('');
    setActiveTab('catalogo');
    setAdminTab('solicitudes');
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!nombre || !carnet || !carrera || !email || !password) {
      setErrorMsg('Por favor llena todos los datos del estudiante.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('Este correo ya está registrado.');
      return;
    }

    const newStudent = {
      id: `est-${Date.now()}`,
      role: 'Estudiante',
      nombre: nombre.trim(),
      carnet: carnet.trim(),
      carrera: carrera.trim(),
      foto: DEFAULT_AVATAR,
      email: email.trim().toLowerCase(),
      password
    };

    const updatedUsers = [...users, newStudent];
    await saveUsers(updatedUsers);
    setCurrentUser(newStudent);
    setEmail('');
    setPassword('');
    setNombre('');
    setCarnet('');
    Alert.alert('Bienvenido', 'Registro de estudiante completado.');
  };

  const handleSolicitarPrestamo = async (equipo) => {
    const equipoActual = equipos.find((e) => e.id === equipo.id);
    if (!equipoActual || !equipoActual.disponible) {
      Alert.alert('No disponible', 'Este equipo ya se encuentra prestado.');
      return;
    }

    const yaSolicitado = prestamos.some(
      (p) => p.equipoId === equipo.id && p.usuarioId === currentUser.id && p.estado === 'Pendiente'
    );
    if (yaSolicitado) {
      Alert.alert('Solicitud existente', 'Ya tienes una solicitud pendiente para este equipo.');
      return;
    }

    const hoy = new Date();
    const devolucion = new Date();
    devolucion.setDate(hoy.getDate() + 3);

    const nuevoPrestamo = {
      id: `prest-${Date.now()}`,
      usuarioId: currentUser.id,
      estudianteNombre: currentUser.nombre,
      estudianteCarnet: currentUser.carnet,
      equipoId: equipo.id,
      equipoNombre: equipo.nombre,
      fechaPrestamo: hoy.toLocaleDateString('es-GT'),
      fechaDevolucion: devolucion.toLocaleDateString('es-GT'),
      estado: 'Pendiente'
    };

    await savePrestamos([nuevoPrestamo, ...prestamos]);
    Alert.alert('Solicitud Enviada', `Devolución estimada: ${nuevoPrestamo.fechaDevolucion}`);
  };

  const handleCambiarEstadoPrestamo = async (prestamoId, nuevoEstado) => {
    const prestamoObj = prestamos.find((p) => p.id === prestamoId);
    if (!prestamoObj) return;

    if (nuevoEstado === 'Aprobado') {
      const eq = equipos.find((e) => e.id === prestamoObj.equipoId);
      if (!eq || !eq.disponible) {
        Alert.alert('Conflicto de Inventario', 'El equipo ya fue aprobado para otro estudiante.');
        return;
      }
      const updatedEquipos = equipos.map((e) =>
        e.id === prestamoObj.equipoId ? { ...e, disponible: false } : e
      );
      await saveEquipos(updatedEquipos);
    }

    if (nuevoEstado === 'Devuelto') {
      const updatedEquipos = equipos.map((e) =>
        e.id === prestamoObj.equipoId ? { ...e, disponible: true } : e
      );
      await saveEquipos(updatedEquipos);
    }

    const updatedPrestamos = prestamos.map((p) =>
      p.id === prestamoId ? { ...p, estado: nuevoEstado } : p
    );
    await savePrestamos(updatedPrestamos);
  };

  const generarReporteMasSolicitados = () => {
    const conteo = {};
    prestamos.forEach((p) => {
      conteo[p.equipoNombre] = (conteo[p.equipoNombre] || 0) + 1;
    });
    return Object.entries(conteo)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.authContainer}>
          <Text style={styles.title}>Laboratorio - Préstamo de Equipos</Text>
          <Text style={styles.subtitle}>Selecciona tu tipo de acceso</Text>

          <View style={styles.roleSelectorRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                loginRoleTab === 'Estudiante' ? styles.roleBtnActive : styles.roleBtnInactive
              ]}
              onPress={() => handleSelectRoleTab('Estudiante')}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  loginRoleTab === 'Estudiante' ? styles.roleBtnTextActive : styles.roleBtnTextInactive
                ]}
              >
                Estudiante
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                loginRoleTab === 'Administrador' ? styles.roleBtnActive : styles.roleBtnInactive
              ]}
              onPress={() => handleSelectRoleTab('Administrador')}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  loginRoleTab === 'Administrador' ? styles.roleBtnTextActive : styles.roleBtnTextInactive
                ]}
              >
                Administrador
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.formHeader}>
              {loginRoleTab === 'Administrador'
                ? 'Acceso Administrador'
                : authMode === 'login'
                ? 'Inicio de Sesión Estudiante'
                : 'Registro de Estudiante'}
            </Text>

            {loginRoleTab === 'Estudiante' && authMode === 'register' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="#A1887F"
                  value={nombre}
                  onChangeText={setNombre}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Carnet universitario (ej. 0903-25-22958)"
                  placeholderTextColor="#A1887F"
                  value={carnet}
                  onChangeText={setCarnet}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Carrera"
                  placeholderTextColor="#A1887F"
                  value={carrera}
                  onChangeText={setCarrera}
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder={
                loginRoleTab === 'Administrador'
                  ? 'Correo de administrador'
                  : 'Correo institucional'
              }
              placeholderTextColor="#A1887F"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#A1887F"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={authMode === 'login' ? handleLogin : handleRegister}
            >
              <Text style={styles.btnText}>
                {loginRoleTab === 'Administrador'
                  ? 'Entrar al Panel Admin'
                  : authMode === 'login'
                  ? 'Ingresar como Estudiante'
                  : 'Crear Cuenta de Estudiante'}
              </Text>
            </TouchableOpacity>

            {loginRoleTab === 'Estudiante' && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setErrorMsg('');
                }}
              >
                <Text style={styles.linkText}>
                  {authMode === 'login'
                    ? '¿Eres estudiante nuevo? Regístrate aquí'
                    : '¿Ya tienes cuenta? Inicia sesión'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentUser.role === 'Estudiante') {
    const misPrestamos = prestamos.filter((p) => p.usuarioId === currentUser.id);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Portal Estudiante</Text>
          <TouchableOpacity onPress={() => setCurrentUser(null)}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'catalogo' && styles.activeTab]}
            onPress={() => setActiveTab('catalogo')}
          >
            <Text style={styles.tabText}>Catálogo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mis_prestamos' && styles.activeTab]}
            onPress={() => setActiveTab('mis_prestamos')}
          >
            <Text style={styles.tabText}>Mis Préstamos ({misPrestamos.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'perfil' && styles.activeTab]}
            onPress={() => setActiveTab('perfil')}
          >
            <Text style={styles.tabText}>Mi Perfil</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'catalogo' && (
          <FlatList
            data={equipos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.imagen }} style={styles.cardImg} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.nombre}</Text>
                  <Text style={styles.cardDesc}>{item.descripcion}</Text>
                  <Text style={[styles.badge, item.disponible ? styles.badgeOk : styles.badgeNo]}>
                    {item.disponible ? 'Disponible' : 'Prestado'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.primaryBtn, !item.disponible && styles.disabledBtn]}
                    disabled={!item.disponible}
                    onPress={() => handleSolicitarPrestamo(item)}
                  >
                    <Text style={styles.btnText}>Solicitar Préstamo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {activeTab === 'mis_prestamos' && (
          <FlatList
            data={misPrestamos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No has solicitado equipos aún.</Text>}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.equipoNombre}</Text>
                  <Text style={styles.cardDesc}>Fecha Préstamo: {item.fechaPrestamo}</Text>
                  <Text style={styles.cardDesc}>Fecha Devolución: {item.fechaDevolucion}</Text>
                  <Text style={styles.statusText}>Estado: {item.estado}</Text>
                </View>
              </View>
            )}
          />
        )}

        {activeTab === 'perfil' && (
          <View style={styles.profileCard}>
            <Image source={{ uri: currentUser.foto || DEFAULT_AVATAR }} style={styles.avatar} />
            <Text style={styles.profileName}>{currentUser.nombre}</Text>
            <Text style={styles.profileInfo}>Carnet: {currentUser.carnet}</Text>
            <Text style={styles.profileInfo}>Carrera: {currentUser.carrera}</Text>
            <Text style={styles.profileInfo}>Correo: {currentUser.email}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const solicitudesPendientes = prestamos.filter((p) => p.estado === 'Pendiente');
  const prestamosActivos = prestamos.filter((p) => p.estado === 'Aprobado');
  const reporte = generarReporteMasSolicitados();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Administrador</Text>
        <TouchableOpacity onPress={() => setCurrentUser(null)}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, adminTab === 'solicitudes' && styles.activeTab]}
          onPress={() => setAdminTab('solicitudes')}
        >
          <Text style={styles.tabText}>Solicitudes ({solicitudesPendientes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, adminTab === 'activos' && styles.activeTab]}
          onPress={() => setAdminTab('activos')}
        >
          <Text style={styles.tabText}>Activos ({prestamosActivos.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, adminTab === 'reporte' && styles.activeTab]}
          onPress={() => setAdminTab('reporte')}
        >
          <Text style={styles.tabText}>Reporte</Text>
        </TouchableOpacity>
      </View>

      {adminTab === 'solicitudes' && (
        <FlatList
          data={solicitudesPendientes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay solicitudes pendientes.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.equipoNombre}</Text>
                <Text style={styles.cardDesc}>
                  Estudiante: {item.estudianteNombre} ({item.estudianteCarnet})
                </Text>
                <Text style={styles.cardDesc}>
                  Del {item.fechaPrestamo} al {item.fechaDevolucion}
                </Text>
                <View style={styles.rowBtns}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#4E6E58' }]}
                    onPress={() => handleCambiarEstadoPrestamo(item.id, 'Aprobado')}
                  >
                    <Text style={styles.btnText}>Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#A04030' }]}
                    onPress={() => handleCambiarEstadoPrestamo(item.id, 'Rechazado')}
                  >
                    <Text style={styles.btnText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {adminTab === 'activos' && (
        <FlatList
          data={prestamosActivos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay préstamos activos.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.equipoNombre}</Text>
                <Text style={styles.cardDesc}>En posesión de: {item.estudianteNombre}</Text>
                <Text style={styles.cardDesc}>Devolución esperada: {item.fechaDevolucion}</Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 10, backgroundColor: '#8D6E63' }]}
                  onPress={() => handleCambiarEstadoPrestamo(item.id, 'Devuelto')}
                >
                  <Text style={styles.btnText}>Marcar como Devuelto</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {adminTab === 'reporte' && (
        <View style={styles.listContent}>
          <Text style={styles.sectionTitle}>Equipos Más Solicitados</Text>
          {reporte.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay datos de préstamos registrados.</Text>
          ) : (
            reporte.map((r, idx) => (
              <View key={idx} style={styles.reportRow}>
                <Text style={styles.reportName}>{idx + 1}. {r.nombre}</Text>
                <Text style={styles.reportCount}>{r.total} solicitudes</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EFE6' },
  authContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3E2723', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6D4C41', textAlign: 'center', marginBottom: 18 },
  roleSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#E6D8C9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 18
  },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#6F4E37' },
  roleBtnInactive: { backgroundColor: 'transparent' },
  roleBtnText: { fontWeight: 'bold', fontSize: 15 },
  roleBtnTextActive: { color: '#FFFDF9' },
  roleBtnTextInactive: { color: '#5D4037' },
  authCard: {
    backgroundColor: '#FFFDF9',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D8C9',
    elevation: 2
  },
  formHeader: { fontSize: 18, fontWeight: 'bold', color: '#3E2723', marginBottom: 16, textAlign: 'center' },
  input: {
    backgroundColor: '#FAF6F0',
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#3E2723'
  },
  errorBox: {
    backgroundColor: '#F5E1DA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A04030'
  },
  errorText: {
    color: '#8C3B2B',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13
  },
  primaryBtn: { backgroundColor: '#6F4E37', padding: 14, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#BCAAA4' },
  btnText: { color: '#FFFDF9', fontWeight: 'bold', fontSize: 15 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#8D6E63', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4E342E'
  },
  headerTitle: { color: '#F5EFE6', fontSize: 18, fontWeight: 'bold' },
  logoutText: { color: '#D7CCC8', fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#EFE6DD', borderBottomWidth: 1, borderColor: '#D7CCC8' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#6F4E37' },
  tabText: { fontWeight: '600', color: '#4E342E', fontSize: 13 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E6D8C9'
  },
  cardImg: { width: '100%', height: 140, backgroundColor: '#EFE6DD' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#3E2723', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#6D4C41', marginBottom: 6 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10
  },
  badgeOk: { backgroundColor: '#E6EFE6', color: '#2E5A36' },
  badgeNo: { backgroundColor: '#F5E1DA', color: '#8C3B2B' },
  statusText: { marginTop: 6, fontWeight: 'bold', color: '#795548' },
  emptyText: { textAlign: 'center', color: '#8D6E63', marginTop: 30 },
  profileCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6D8C9'
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, backgroundColor: '#EFE6DD' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#3E2723', marginBottom: 8 },
  profileInfo: { fontSize: 15, color: '#6D4C41', marginBottom: 4 },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallBtn: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#3E2723' },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6D8C9'
  },
  reportName: { fontWeight: '600', color: '#3E2723' },
  reportCount: { fontWeight: 'bold', color: '#6F4E37' }
});
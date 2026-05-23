// frontend/src/app.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contextos/auth_context';
import { useAuth } from './contextos/auth_context';
import Welcome from './paginas/welcome';
import Login from './componentes/auth/login';
import RegistroVoluntario from './componentes/auth/registro_voluntario';
import RegistroOrganizacion from './componentes/auth/registro_organizacion';
import RutaProtegida from './componentes/comunes/ruta_protegida';
import FeedVoluntario from './componentes/voluntario/feed';
import PerfilVoluntario from './componentes/voluntario/perfil_voluntario';
import PanelOrganizacion from './componentes/organizacion/panel_organizacion';
import FormularioPublicacion from './componentes/organizacion/formulario_publicacion';
import ListaPostulantes from './componentes/organizacion/lista_postulantes';
import PanelAdmin from './componentes/admin/panel_admin';
import { Toaster } from 'react-hot-toast';
import PerfilOrganizacion from './componentes/organizacion/perfil_organizacion';
import AcercaDe from './paginas/acerca_de';
import Terminos from './paginas/terminos';
import LoginAdmin from './componentes/auth/login_admin';
import RegistroAdmin from './componentes/auth/registro_admin';
import useIdleTimeout from './hooks/useIdleTimeout';
import Layout from './componentes/comunes/layout';
import MisPostulaciones from './componentes/voluntario/mis_postulaciones';
import MisCertificados from './componentes/voluntario/mis_certificados';
import EditarPerfilOrganizacion from './componentes/organizacion/editar_perfil_organizacion';
import EditarPerfilVoluntario from './componentes/voluntario/editar_perfil_voluntario';
import OlvidePassword from './componentes/auth/olvide_password';
import ResetPassword from './componentes/auth/reset_password';
import OlvidePasswordAlternativo from './componentes/auth/olvide_password_alternativo';



function App() {
    return (
        <>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
            <Toaster position="top-right" />
        </>
    );
}

/**
 * Componente auxiliar para manejar la lógica de redirección de /login.
 * Utiliza useEffect para ejecutar el logout de forma segura fuera del ciclo de renderizado,
 * evitando el error de "Cannot update a component while rendering a different component".
 */
const LoginRedirect = () => {
    const { user, logout } = useAuth();

    React.useEffect(() => {
        // Mantenemos la restricción: si un Admin intenta entrar por el login general,
        // cerramos su sesión automáticamente.
        if (user && user.rol === 'admin') {
            logout();
        }
    }, [user, logout]);

    // Si no hay usuario o es un admin (que acaba de ser deslogueado por el useEffect), 
    // mostramos el componente Login normal.
    if (!user || user.rol === 'admin') return <Login />;
    
    // Voluntario: lo mantenemos logueado y lo enviamos al feed.
    if (user.rol === 'voluntario') return <Navigate to="/feed" replace />;
    // Organización: lo enviamos a su panel.
    if (user.rol === 'organizacion') return <Navigate to="/organizacion/panel" replace />;

    return <Login />;
};

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/registro/voluntario" element={<RegistroVoluntario />} />
            <Route path="/registro/organizacion" element={<RegistroOrganizacion />} />
            <Route path="/admin/login" element={<LoginAdmin />} />
            <Route path="/admin/registro" element={<RegistroAdmin />} />
            <Route path="/olvide-password" element={<OlvidePassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/olvide-password-alternativo" element={<OlvidePasswordAlternativo />} />
            <Route path="/acerca-de" element={<AcercaDe />} />
            <Route path="/terminos" element={<Terminos />} />

            {/* Rutas protegidas con Layout */}
            <Route element={<Layout />}>
                {/* Voluntario */}
                <Route path="/feed" element={<RutaProtegida rolesPermitidos={['voluntario']}><FeedVoluntario /></RutaProtegida>} />
                <Route path="/perfil" element={<RutaProtegida rolesPermitidos={['voluntario']}><PerfilVoluntario /></RutaProtegida>} />
                <Route path="/perfil/editar" element={<RutaProtegida rolesPermitidos={['voluntario']}><EditarPerfilVoluntario /></RutaProtegida>} />
                {/* <Route path="/perfil/editar" element={<RutaProtegida rolesPermitidos={['voluntario']}><EditarPerfilVoluntario /></RutaProtegida>} /> */}
                <Route path="/mis-certificados" element={<RutaProtegida rolesPermitidos={['voluntario']}><MisCertificados /></RutaProtegida>} />

                {/* Organización */}
                <Route path="/organizacion/panel" element={<RutaProtegida rolesPermitidos={['organizacion']}><PanelOrganizacion /></RutaProtegida>} />
                <Route path="/organizacion/perfil" element={<RutaProtegida rolesPermitidos={['organizacion']}><PerfilOrganizacion /></RutaProtegida>} />
                <Route path="/organizacion/perfil/editar" element={<RutaProtegida rolesPermitidos={['organizacion']}><EditarPerfilOrganizacion /></RutaProtegida>} />
                <Route path="/organizacion/nueva-publicacion" element={<RutaProtegida rolesPermitidos={['organizacion']}><FormularioPublicacion /></RutaProtegida>} />
                <Route path="/organizacion/editar-publicacion/:id" element={<RutaProtegida rolesPermitidos={['organizacion']}><FormularioPublicacion /></RutaProtegida>} />
                <Route path="/organizacion/publicaciones/:publicacionId/postulantes" element={<RutaProtegida rolesPermitidos={['organizacion']}><ListaPostulantes /></RutaProtegida>} />

                {/* Admin */}
                <Route path="/admin/panel" element={<RutaProtegida rolesPermitidos={['admin']}><PanelAdmin /></RutaProtegida>} />
                <Route path="/admin/usuarios" element={<RutaProtegida rolesPermitidos={['admin']}><PanelAdmin tab="usuarios" /></RutaProtegida>} />
                <Route path="/admin/organizaciones" element={<RutaProtegida rolesPermitidos={['admin']}><PanelAdmin tab="organizaciones" /></RutaProtegida>} />
                <Route path="/admin/eventos" element={<RutaProtegida rolesPermitidos={['admin']}><PanelAdmin tab="eventos" /></RutaProtegida>} />
                <Route path="/olvide-password" element={<OlvidePassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
export default App;
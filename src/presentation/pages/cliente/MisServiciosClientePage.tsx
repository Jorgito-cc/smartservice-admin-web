import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarServiciosPorCliente, type Servicio } from "../../../api/servicio";
import { FaTools, FaCheckCircle, FaClock, FaComments, FaCreditCard, FaStar } from "react-icons/fa";

export const MisServiciosClientePage = () => {
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState<string>("todos");
    const navigate = useNavigate();

    useEffect(() => {
        cargarServicios();
    }, []);

    const cargarServicios = async () => {
        try {
            setLoading(true);
            const data = await listarServiciosPorCliente();
            setServicios(data);
        } catch (error) {
            console.error("Error cargando servicios:", error);
        } finally {
            setLoading(false);
        }
    };

    const serviciosFiltrados = filtroEstado === "todos"
        ? servicios
        : servicios.filter(s => s.estado === filtroEstado);

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "en_camino":
                return "bg-blue-100 text-blue-800";
            case "en_ejecucion":
                return "bg-yellow-100 text-yellow-800";
            case "completado":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getEstadoIcon = (estado: string) => {
        switch (estado) {
            case "en_camino":
                return <FaClock className="text-blue-600" />;
            case "en_ejecucion":
                return <FaTools className="text-yellow-600" />;
            case "completado":
                return <FaCheckCircle className="text-green-600" />;
            default:
                return null;
        }
    };

    const getEstadoTexto = (estado: string) => {
        switch (estado) {
            case "en_camino":
                return "En Camino";
            case "en_ejecucion":
                return "En Ejecución";
            case "completado":
                return "Completado";
            default:
                return estado;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Mis Servicios</h1>

                {/* Filtros */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFiltroEstado("todos")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${filtroEstado === "todos"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFiltroEstado("en_camino")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${filtroEstado === "en_camino"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        En Camino
                    </button>
                    <button
                        onClick={() => setFiltroEstado("en_ejecucion")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${filtroEstado === "en_ejecucion"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        En Ejecución
                    </button>
                    <button
                        onClick={() => setFiltroEstado("completado")}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap ${filtroEstado === "completado"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        Completados
                    </button>
                </div>
            </div>

            {serviciosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <FaTools className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600">No tienes servicios {filtroEstado !== "todos" ? `con estado "${getEstadoTexto(filtroEstado)}"` : ""}</p>
                    {filtroEstado === "todos" && (
                        <button
                            onClick={() => navigate("/cliente/solicitar")}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Crear Solicitud
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {serviciosFiltrados.map((servicio: any) => (
                        <div
                            key={servicio.id_servicio}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Servicio #{servicio.id_servicio}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {servicio.SolicitudServicio?.Categoria?.nombre}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Asignado: {new Date(servicio.fecha_asignacion).toLocaleDateString("es-BO")}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getEstadoColor(servicio.estado)}`}>
                                    {getEstadoIcon(servicio.estado)}
                                    <span className="font-medium text-xs">{getEstadoTexto(servicio.estado)}</span>
                                </div>
                            </div>

                            {/* Descripción */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {servicio.SolicitudServicio?.descripcion}
                            </p>

                            {/* Técnico Info */}
                            {servicio.Tecnico && (
                                <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                        {servicio.Tecnico.Usuario?.foto ? (
                                            <img
                                                src={servicio.Tecnico.Usuario.foto}
                                                alt="Técnico"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-gray-600 font-semibold">
                                                {servicio.Tecnico.Usuario?.nombre?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {servicio.Tecnico.Usuario?.nombre} {servicio.Tecnico.Usuario?.apellido}
                                        </p>
                                        <p className="text-xs text-gray-500">Técnico Asignado</p>
                                    </div>
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => navigate(`/cliente/servicio/${servicio.id_servicio}/chat`)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <FaComments />
                                    Chat con Técnico
                                </button>

                                {servicio.estado === "completado" && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/cliente/servicio/${servicio.id_servicio}/pago`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            <FaCreditCard />
                                            Pagar
                                        </button>
                                        <button
                                            onClick={() => navigate(`/cliente/servicio/${servicio.id_servicio}/calificar`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                                        >
                                            <FaStar />
                                            Calificar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

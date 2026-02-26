import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Bot, ArrowLeft } from "lucide-react";

export default function RobotsPage() {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' or 'add'
  const [formData, setFormData] = useState({
    name: "",
    robotId: "",
    status: "offline",
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/robots");
      const data = await res.json();
      if (Array.isArray(data)) setRobots(data);
    } catch (err) {
      console.error("Erreur fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // CRUCIAL : Conversion des strings en Numbers pour Mongoose
    const dataToSend = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    };

    try {
      const res = await fetch("http://localhost:5000/api/robots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      const responseData = await res.json();

      if (res.ok) {
        setView("list");
        fetchRobots();
        // Reset du formulaire
        setFormData({ name: "", robotId: "", status: "offline", latitude: 0, longitude: 0 });
      } else {
        // Affiche l'erreur exacte du backend (ex: ID déjà utilisé)
        alert("Erreur: " + (responseData.message || "Impossible d'ajouter le robot"));
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
      alert("Erreur de connexion au serveur");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce robot ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/robots/${id}`, { method: "DELETE" });
      if (res.ok) fetchRobots();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-600 border-green-200";
      case "offline": return "bg-red-100 text-red-600 border-red-200";
      default: return "bg-yellow-100 text-yellow-600 border-yellow-200";
    }
  };

  if (view === "add") {
    return (
      <div className="max-w-2xl bg-white p-8 rounded-xl border shadow-sm mx-auto">
        <button 
          onClick={() => setView("list")} 
          className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black transition"
        >
          <ArrowLeft size={18} /> Retour à la liste
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Enregistrer un Nouveau Robot</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Robot</label>
              <input 
                placeholder="ex: Alpha-1" 
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.name}
                required
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Unique</label>
              <input 
                placeholder="ex: R-100" 
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.robotId}
                required
                onChange={e => setFormData({...formData, robotId: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input 
                type="number" step="any" 
                placeholder="0.0000" 
                className="p-2 border rounded w-full" 
                value={formData.latitude}
                required
                onChange={e => setFormData({...formData, latitude: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input 
                type="number" step="any" 
                placeholder="0.0000" 
                className="p-2 border rounded w-full" 
                value={formData.longitude}
                required
                onChange={e => setFormData({...formData, longitude: e.target.value})} 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="bg-[#0b1426] text-white px-6 py-3 rounded-lg w-full mt-4 hover:bg-opacity-90 transition font-bold"
          >
            Confirmer l'Enregistrement
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Flotte de Robots</h2>
          <p className="text-gray-500">Gérez et surveillez vos unités de téléprésence.</p>
        </div>
        <button 
          onClick={() => setView("add")} 
          className="flex items-center gap-2 bg-[#0b1426] text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus size={18} /> Ajouter un Robot
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 italic">Chargement de la flotte...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.length === 0 ? (
            <p className="col-span-full text-center py-10 text-gray-400">Aucun robot enregistré.</p>
          ) : (
            robots.map((robot) => (
              <div key={robot._id} className="bg-white p-6 rounded-xl shadow-sm border relative hover:shadow-md transition">
                <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] uppercase font-bold rounded-full border ${statusColor(robot.status)}`}>
                  {robot.status}
                </span>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg"><Bot className="text-blue-600" /></div>
                  <div>
                    <h3 className="font-bold text-gray-800">{robot.name}</h3>
                    <p className="text-xs text-gray-400">ID: {robot.robotId}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
                  <p>📍 Location: {robot.latitude} , {robot.longitude}</p>
                </div>
                <div className="flex justify-between mt-6">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">Détails</button>
                  <button 
                    onClick={() => handleDelete(robot._id)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
import type { AuthUser } from "@/types/auth";

interface OperatorDashboardProps {
  onLogout: () => void;
  user: AuthUser;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  onLogout,
  user,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-xl p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Operator Dashboard</h2>

        <p>Welcome {user?.name}</p>

        <button
          onClick={onLogout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default OperatorDashboard;

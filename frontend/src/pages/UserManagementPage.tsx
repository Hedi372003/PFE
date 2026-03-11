import { useEffect, useState } from "react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await res.json()) as UserRow[];
      setUsers(Array.isArray(data) ? data : []);
    };

    void fetchUsers();
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Management</h2>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      >
        Logout
      </button>

      <table border={1} width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const API_URL = "http://localhost:5000/api/users";

export const getUsers = async (token: string): Promise<ApiUser[]> => {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return (await res.json()) as ApiUser[];
};

export const deleteUser = async (
  id: string,
  token: string
): Promise<{ message?: string }> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return (await res.json()) as { message?: string };
};

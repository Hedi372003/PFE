const API_URL = "http://localhost:5000/api/users";

export const getUsers = async (token) => {
  const res = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};

export const deleteUser = async (id, token) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};

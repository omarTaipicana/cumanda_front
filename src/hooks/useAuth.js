import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import getConfigToken from "../services/getConfigToken";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [verified, setVerified] = useState("");
  const [userRegister, setUserRegister] = useState("");
  const [userUpdate, setUserUpdate] = useState("");
  const [userLogged, setUserLogged] = useState();
  const [userResetPassword, setUserResetPassword] = useState("");
  const [deleteReg, setDeleteReg] = useState();


  const navigate = useNavigate();
  const urlBase = import.meta.env.VITE_API_URL;

  const registerUser = (data) => {
    setIsLoading(true);
    const url = `${urlBase}/users`;
    axios
      .post(url, data)
      .then((res) => {
        setUserRegister(res.data);
        // navigate("/login");
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  };

  const updateUser = (data, id) => {
    setIsLoading(true);
    const url = `${urlBase}/users/${id}`;
    axios
      .put(url, data, getConfigToken())
      .then((res) => {
        setUserUpdate(res.data);
        // navigate("/login");
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  };

  const loginUser = (data) => {
    setIsLoading(true);
    const url = `${urlBase}/users/login`;
    axios
      .post(url, data)
      .then((res) => {
        // setUserLogged(res.data);
        localStorage.setItem("token", res.data.token);
        // localStorage.setItem("user", JSON.stringify(res.data.user));
        // navigate("/");
      })
      .catch((err) => {
        setError(err);
        console.log(err)
        localStorage.removeItem("token");
        // localStorage.removeItem("user");
      })
      .finally(() => setIsLoading(false));
  };

  const loggedUser = async () => {
    setIsLoading(true);
    const url = `${urlBase}/users/me`;
    try {
      const res = await axios.get(url, getConfigToken());
      setUserLogged(res.data);
      return true;
    } catch (error) {
      setError(error);
      return false;  // Indica fallo pero no lanza error
    } finally {
      setIsLoading(false);
    }
  };



  const verifyUser = (code) => {
    setIsLoading(true);
    const url = `${urlBase}/users/verify/${code}`;
    axios
      .get(url)
      .then((res) => {
        // console.log(res.data);
        setVerified(res.data);
      })
      .catch((err) => {
        // console.log(err);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  };

  const sendEmail = (data) => {
    setIsLoading(true);
    const url = `${urlBase}/users/reset_password`;
    axios
      .post(url, data)
      .then((res) => {
        // console.log(res.data);
        setUserResetPassword(res.data);
        // navigate("/login");
      })
      .catch((error) => {
        // console.log(error);
        setError(error);
      })
      .finally(() => setIsLoading(false));
  };

  const changePassword = (data, code) => {
    setIsLoading(true);
    const url = `${urlBase}/users/reset_password/${code}`;
    axios
      .post(url, data)
      .then((res) => {
        console.log(res.data);
        navigate("/login");
      })
      .catch((error) => {
        // console.log(error);
        setError(error);
      })
      .finally(() => setIsLoading(false));
  };

  const deleteUser = ( id) => {
    setIsLoading(true);
    const url = `${urlBase}/users/${id}`;
    axios
      .delete(url, getConfigToken())
      .then((res) => {
        // console.log(res.data);
        setDeleteReg(res.data);
      })
      .finally(() => setIsLoading(false))
      .catch((err) => {
        setError(err);
        // console.log(err);
      });
  };

  return [
    registerUser,
    updateUser,
    loginUser,
    loggedUser,
    verifyUser,
    userRegister,
    isLoading,
    error,
    verified,
    sendEmail,
    userResetPassword,
    changePassword,
    userUpdate,
    userLogged,
    setUserLogged,
    deleteUser,
    deleteReg,
  ];
};

export default useAuth;

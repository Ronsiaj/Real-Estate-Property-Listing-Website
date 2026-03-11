import { createContext, useContext, useEffect, useState } from "react";
import { deleteAllCookies, getCookie, reloadWindowToPath, setCookie } from "../Helpers/Utils";
import { useDispatch } from "react-redux";
import { loadingFalse, loadingTrue } from "../Reducer/loaderSlice";
import { clearValue } from "../Reducer/customerSlice";
import { toast } from "react-toastify";
const AuthContext = createContext();

function AuthenticateProvider({ children }) {
  const [userDetails, setUserDetails] = useState({})
  const token = getCookie("token")
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const dispatch = useDispatch();

  const logIn = (token, person) => {
    if (token) {
      localStorage.removeItem('filter')
      setCookie("token", token);
      setCookie("person", person);
      setIsAuthenticated(true);
    }
  };

  const logOut = async () => {
    dispatch(loadingTrue())
    setTimeout(() => {
      deleteAllCookies()
      setIsAuthenticated(false);
      reloadWindowToPath('/login');
      toast.success("Logout successfull");
      dispatch(loadingFalse())
      dispatch(clearValue());
    }, 1000);
  }

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ logIn, logOut, isAuthenticated, userDetails, setIsAuthenticated, setUserDetails , token }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthenticateProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
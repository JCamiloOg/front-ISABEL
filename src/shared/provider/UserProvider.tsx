import { useCallback, useState } from "react";
import type { LoggedUser } from "../../@types/Users";
import UserContext from "../context/user.context";

export default function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<LoggedUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    // const [isPending, setIsPending] = useState(true);

    // const initializeAuth = useCallback(async () => {
    //     try {
    //         const res = await refreshToken();

    //         if (res.status === 200) {
    //             setAccessToken(res.data.accessToken || null);
    //             setUser(res.data.user || null);
    //         }

    //     } catch {
    //         console.log("No LoggedUser");
    //     } finally {
    //         setTimeout(() => setIsPending(false), 500);
    //     }

    // }, []);

    // useEffect(() => {
    //     // eslint-disable-next-line
    //     initializeAuth();
    // }, [initializeAuth]);

    // useEffect(() => {
    //     const handleVisibilityChange = async () => {
    //         if (document.visibilityState === "visible" && !accessToken) {
    //             try {
    //                 const res = await refreshToken();
    //                 if (res.status === 200 && res.data.accessToken) {
    //                     setAccessToken(res.data.accessToken);
    //                     if (res.data.user) setUser(res.data.user);
    //                 }
    //             } catch {
    //                 // Si el refresh token también caducó, se mantendrá como usuario no autenticado
    //             }
    //         }
    //     };

    //     document.addEventListener("visibilitychange", handleVisibilityChange);
    //     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // }, [accessToken, setAccessToken, setUser]);

    const logoutUser = useCallback(async () => {
        setUser(null);
        // const res = await logout();
        // if (res.status === 200) {
        //     setUser(null);
        //     setAccessToken(null);
        //     Toast.fire({
        //         icon: "success",
        //         title: res.data.message,
        //     });
        // }
    }, []);



    return (
        <UserContext.Provider value={{ user, setUser, accessToken, setAccessToken, logout: logoutUser }}>
            {children}
        </UserContext.Provider>
    );
}
import { createContext, type Dispatch, type SetStateAction } from "react";
import type { LoggedUser } from "../../@types/Users";

export type UserContextType = {
    user: LoggedUser | null;
    setUser: Dispatch<SetStateAction<LoggedUser | null>>;
    accessToken: string | null;
    setAccessToken: Dispatch<SetStateAction<string | null>>;
    logout: () => void;
    // isPending: boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export default UserContext;
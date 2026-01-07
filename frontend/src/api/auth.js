import {api} from "./api.js"

export const register = async(name, email, password) => {
    try {
        const response = await api.post('/register', {name, email, password});
        return response.data;
    } catch (e) {
        return e;
    }
}

export const login = async(email, password ) => {
    try{
        const response = await api.post('/login', {email, password});
        localStorage.setItem("accessToken", response.data.access_token);
    } catch(e) {
        return e;
    }
}

export const logout = async() => {
    try{
        localStorage.removeItem("accessToken");
        // await api.post("/logout");
    } catch(e) {
        return e;
    }
}
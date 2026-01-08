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
        return response.data;
    } catch(e) {
        return e;
    }
}

export const logout = async() => {
    try{
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user")
        // await api.post("/logout");
    } catch(e) {
        return e;
    }
}

export const getCurrentUser = async() => {
    try{
        const response = await api.get('/me');
        return response.data;
    } catch(e) {
        return e;
    }
}
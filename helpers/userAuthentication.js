

import pkg from 'jsonwebtoken';
import { GraphQLError } from "graphql";
import dotenv from 'dotenv'
const {sign, verify} = pkg
dotenv.config()



export const verifyUser = async(req) => {
    try {
        const token = req.token
        const decodedUser = verify(token, process.env.SECRET_ACCESS_KEY);
        return decodedUser
    } catch (error) {
        // console.log(error.message, "eRRRR")
        throw new GraphQLError('Your session expired, please login again.', {
            extensions: {
                code: 'Invalid/Expired token',
            },
        })
    }
}


export const issueAuthToken = async (jwtPayload) => {
    let token = await sign(jwtPayload, process.env.SECRET_ACCESS_KEY, {
        expiresIn:process.env.SECRET_ACCESS_TIME
    });
    return `${token}`;
};


export const issueAuthRefreshToken = async (jwtPayload) => {
    let token = await sign(jwtPayload, process.env.SECRET_REFRESH_KEY, {
        expiresIn: process.env.SECRET_REFRESH_TIME
    });
    return `${token}`;
}

export const localVariables = async () => {

}

// export const serializeUser = user => pick(user, [
//     'id',
//     'email',
//     'username',
//     'role',
// ]);
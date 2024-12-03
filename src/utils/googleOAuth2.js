import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';

const googleOAuth2Client = new OAuth2Client({
    clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_AUTH_REDIRECT_URI,
});

export const generateAuthUrl = () => {
    return googleOAuth2Client.generateAuthUrl({
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    });
};

export const validateCode = async (code) => {
    try {
        const response = await googleOAuth2Client.getToken(code);

        const ticket = await googleOAuth2Client.verifyIdToken({
            idToken: response.tokens.id_token
        });

        return ticket;

    }catch(error) {
        if (error.response && error.response.status >= 400 && error.response.status <=499) {throw createHttpError(401, 'Unauthorized');
        } else {
          throw error;
        }
   }
};

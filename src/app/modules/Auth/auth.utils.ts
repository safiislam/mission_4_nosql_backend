import jwt, { JwtPayload } from 'jsonwebtoken';
export const createToken = (jwtPayload: { userId: string, role: string }, secret: string, expiresIn: string) => {
    return jwt.sign({
        data: jwtPayload,
    }, secret, { expiresIn })
}

export const htmlTemplaet = (resetUiLink: string) => {
    return `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

    <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333333;">Reset Your Password</h2>
        
        <p style="color: #666666;">Hello [Recipient Name],</p>
        
        <p style="color: #666666;">You recently requested to reset your password for your account. Click the button below to reset it.</p>
        
        <a href=${resetUiLink} style="background-color: #007BFF; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">Reset Password</a>
        
        <p style="color: #666666; margin-top: 20px;">If you did not request a password reset, please ignore this email or contact support.</p>
        
        <p style="color: #666666;">Thanks,<br> 
        The [Your Company Name] Team</p>
        
        <hr style="border: none; border-top: 1px solid #dddddd; margin: 20px 0;">
        
        <p style="color: #999999;">If you’re having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:</p>
        
        <a href="#" style="color: #007BFF; text-decoration: none;">https://yourwebsite.com/reset-password</a>
        
    </div>

</div>
`
}

export const verifyJwt = (token: string, secret: string) => {
    return jwt.verify(token, secret) as JwtPayload;
}
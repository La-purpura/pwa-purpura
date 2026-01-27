
import * as OTPAuth from "otpauth";

const APP_NAME = "La Purpura";

/**
 * Generates a new TOTP secret and QR code URL.
 */
export function generateTwoFactorSecret(email: string) {
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
        issuer: APP_NAME,
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
    });

    return {
        secret: secret.base32,
        otpauthUrl: totp.toString(), // otpauth://totp/...
    };
}

/**
 * Validates a TOTP token against a secret.
 */
export function verifyTwoFactorToken(token: string, secretBase32: string): boolean {
    const totp = new OTPAuth.TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
}

import { JWTPayload as JoseJWTPayload } from "jose";

/**
 * Interface que define o conteúdo (payload) do nosso crachá digital (JWT).
 */
export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
}

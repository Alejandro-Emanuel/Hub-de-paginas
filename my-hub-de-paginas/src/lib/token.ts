import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/service/authService";

export interface DadosToken {
  id: number;
  tipo: "adm" | "usuario";
}

export function lerTokenDaRequisicao(request: Request): DadosToken | null {
  const cabecalho = request.headers.get("authorization");
  if (!cabecalho?.startsWith("Bearer ") || !SECRET_KEY) return null;

  try {
    const token = cabecalho.replace("Bearer ", "").trim();
    const dados = jwt.verify(token, SECRET_KEY) as DadosToken;
    if (typeof dados.id === "number" && typeof dados.tipo === "string") {
      return dados;
    }
    return null;
  } catch {
    return null;
  }
}
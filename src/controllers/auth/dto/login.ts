import Joi from "joi";

export interface LoginDTO {
  email: string;
  password: string;
}

export const loginDTOShema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

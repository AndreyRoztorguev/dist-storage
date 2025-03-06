import Joi from "joi";

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
}

export const SignupDTOShema = Joi.object<SignupDTO>({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

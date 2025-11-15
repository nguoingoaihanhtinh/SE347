import { ValidationError } from "@/utils/errors";
import { ZodType } from "zod";

const validate = {
    schema_validate: <T>(schema: ZodType<T>, data: unknown): T => {
      const result = schema.safeParse(data);
      if (!result.success) {
    
        const message = result.error.issues.map((e) => {
            return `[${e.path}] ${e.message}`;
        }).join("; ");
    
        throw new ValidationError({ message });
      }
      return result.data;
    }
};

export default validate;
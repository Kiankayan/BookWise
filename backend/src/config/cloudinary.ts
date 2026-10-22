import { v2 as cloudinarySdk } from "cloudinary";

cloudinarySdk.config({
  secure: true,
  debug: true,
});

export default cloudinarySdk;

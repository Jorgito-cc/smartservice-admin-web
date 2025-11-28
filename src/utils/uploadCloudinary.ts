export async function uploadImageCloudinary(file: File): Promise<string> {
    const url = "https://api.cloudinary.com/v1_1/dyqbimuzw/image/upload";
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "reactproyecto");
  
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
  
    if (!data.secure_url) {
      console.error("Error Cloudinary:", data);
      throw new Error("No se pudo subir la imagen a Cloudinary");
    }
  
    return data.secure_url;
  }
  
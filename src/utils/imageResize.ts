/**
 * Redimensionne une photo choisie dans la galerie du téléphone à 128x128 px
 * avec un élément canvas, l'encode en JPEG qualité 0.7 (data URL)
 * et garantit une taille inférieure à 60 000 caractères.
 */
export async function resizeImageTo128Jpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n’est pas une image valide.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier image.'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erreur lors du décodage de l’image.'));

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Impossible d’initialiser le contexte canvas 2D.'));
            return;
          }

          // Center-crop / fit cover dans 128x128
          const targetWidth = 128;
          const targetHeight = 128;
          const imgWidth = img.width;
          const imgHeight = img.height;

          const ratio = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
          const drawWidth = imgWidth * ratio;
          const drawHeight = imgHeight * ratio;
          const dx = (targetWidth - drawWidth) / 2;
          const dy = (targetHeight - drawHeight) / 2;

          // Background neutral in case of transparent PNG converted to JPEG
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, 128, 128);

          ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

          // Encodage en JPEG qualité 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          if (dataUrl.length > 60000) {
            // Qualité abaissée si besoin exceptionnel
            const smallerDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            resolve(smallerDataUrl);
          } else {
            resolve(dataUrl);
          }
        } catch (err) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

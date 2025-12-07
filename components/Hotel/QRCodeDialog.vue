<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal :header="`QR Code for ${hotelName}`" class="w-full max-w-md">
    <div class="text-center p-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Check-in QR Code</h3>
      
      <!-- QR Code Container -->
      <div 
        ref="qrCodeContainer"
        class="flex justify-center items-center bg-gray-50 rounded-lg min-h-[180px] mb-3"
      >
        <div v-if="!isQRGenerated" class="text-gray-500 text-xs">
          Generating QR code...
        </div>
      </div>
      
      <!-- Info Text -->
      <p class="text-xs text-gray-600 mb-6">
        Guests scan to check in
      </p>

      <!-- Download Button -->
      <Button
        label="Download QR Code"
        icon="pi pi-download"
        @click="downloadQRCode"
        :disabled="!isQRGenerated"
        class="w-full"
        severity="primary"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import QRCodeStyling from 'qr-code-styling';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  hotelId: {
    type: String,
    required: true
  },
  hotelName: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// Refs
const qrCodeContainer = ref<HTMLDivElement>(null);
const isQRGenerated = ref(false);
let qrCodeInstance: QRCodeStyling | null = null;

// Generate QR Code when dialog becomes visible
watch(() => props.visible, async (newVisible) => {
  if (newVisible && props.hotelId) {
    await nextTick();
    await generateQRCode();
  }
});

const generateQRCode = async () => {
  if (!props.hotelId || !qrCodeContainer.value) return;

  try {
    // Clear any existing content
    qrCodeContainer.value.innerHTML = '';
    isQRGenerated.value = false;

    // Create QR code URL
    const qrUrl = `https://wa.me/919400408414?text=${encodeURIComponent(`/checkin-${props.hotelId}`)}`;

    // Create QR code instance
    qrCodeInstance = new QRCodeStyling({
      width: 180,
      height: 180,
      type: "canvas",
      data: qrUrl,
      dotsOptions: {
        color: "#2B2B2B",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#FCFCFC"
      }
    });

    // Wait for DOM to be ready
    await nextTick();

    // Small delay to ensure container is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    // Append QR code to container
    qrCodeInstance.append(qrCodeContainer.value);
    
    // Wait a bit for the QR code to render
    await new Promise(resolve => setTimeout(resolve, 200));
    
    isQRGenerated.value = true;
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    isQRGenerated.value = false;
  }
};

const downloadQRCode = async () => {
  if (!props.hotelId || !qrCodeInstance) return;

  try {
    // Create a high-quality QR code (1080px)
    const qrUrl = `https://wa.me/919400408414?text=${encodeURIComponent('/checkin-' + props.hotelId)}`;

    // Create a temporary container for the QR code
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '1080px';
    tempContainer.style.height = '1080px';
    document.body.appendChild(tempContainer);

    // Create QR code with logo
    const highQualityQR = new QRCodeStyling({
      width: 1080,
      height: 1080,
      type: "canvas",
      data: qrUrl,
      image: "/logo.png",
      dotsOptions: {
        color: "#2B2B2B",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#FCFCFC"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.5
      }
    });

    // Append QR code to temporary container
    highQualityQR.append(tempContainer);

    // Wait for render with longer delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the canvas element
    const qrCanvas = tempContainer.querySelector('canvas');
    
    // Ensure canvas is properly rendered
    if (!qrCanvas) {
      console.error('QR code canvas not found');
      throw new Error('Failed to generate QR code canvas');
    }

    if (qrCanvas) {
      // Create a new canvas for our composite image with increased padding
      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');

      // Set dimensions (QR code + increased padding + text space)
      const padding = 200; // Double the padding (200px on all sides)
      const qrSize = 1080;
      const totalWidth = qrSize + (2 * padding);
      const totalHeight = qrSize + (2 * padding) + 200; // Extra space for text

      compositeCanvas.width = totalWidth;
      compositeCanvas.height = totalHeight;

      // Fill background
      ctx.fillStyle = "#FCFCFC";
      ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

      // Draw QR code with padding
      ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

      // Draw dotted guidelines for cutting along the image border
      ctx.strokeStyle = "#CCCCCC";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dotted line

      // Outer border guidelines (along the image border)
      ctx.beginPath();
      ctx.rect(20, 20, totalWidth-40, totalHeight-40);
      ctx.stroke();

      // Reset line dash for text
      ctx.setLineDash([]);

      // Draw hotel name
      ctx.font = "bold 56px Arial, sans-serif";
      ctx.fillStyle = "#2B2B2B";
      ctx.textAlign = "center";
      ctx.fillText(props.hotelName, totalWidth / 2, totalHeight - 180);

      // Draw powered by text
      ctx.font = "32px Arial, sans-serif";
      ctx.fillStyle = "#999999";
      ctx.fillText("POWERED BY LOBBYBEE.COM", totalWidth / 2, totalHeight - 120);

      // Draw cutting instructions
      ctx.font = "16px Arial, sans-serif";
      ctx.fillStyle = "#999999";
      ctx.fillText("Cut along outer dotted lines", totalWidth / 2, totalHeight - 30);

      // Convert to blob and download
      compositeCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `hotel-qr-code-${props.hotelId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // Fallback to basic QR code download
          highQualityQR.download({
            name: `hotel-qr-code-${props.hotelId}`,
            extension: "png"
          });
        }
      }, 'image/png');
    } else {
      // Fallback to basic QR code download
      highQualityQR.download({
        name: `hotel-qr-code-${props.hotelId}`,
        extension: "png"
      });
    }

    // Clean up
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Error downloading high-quality QR code:', error);
    alert('Error generating high-quality QR code. Please try again.');
  }
};
</script>
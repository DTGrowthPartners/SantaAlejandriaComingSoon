import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

interface RoomGalleryDialogProps {
  images: string[];
  roomName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex?: number;
}

const RoomGalleryDialog = ({
  images,
  roomName,
  open,
  onOpenChange,
  startIndex = 0,
}: RoomGalleryDialogProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(startIndex);

  const handleApiChange = (api: CarouselApi) => {
    setApi(api);
    if (api) {
      api.scrollTo(startIndex, true);
      api.on("select", () => {
        setCurrent(api.selectedScrollSnap());
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black/95 border-none">
        <DialogTitle className="sr-only">
          Galería de fotos — {roomName}
        </DialogTitle>
        <div className="relative">
          <Carousel
            opts={{ loop: true, startIndex }}
            setApi={handleApiChange}
            className="w-full"
          >
            <CarouselContent>
              {images.map((img, i) => (
                <CarouselItem key={i}>
                  <div className="flex items-center justify-center min-h-[50vh] max-h-[85vh]">
                    <img
                      src={img}
                      alt={`${roomName} - Foto ${i + 1}`}
                      className="max-w-full max-h-[85vh] object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/10 hover:bg-white/20 border-none text-white h-10 w-10" />
            <CarouselNext className="right-2 bg-white/10 hover:bg-white/20 border-none text-white h-10 w-10" />
          </Carousel>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-sans">
            {current + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomGalleryDialog;

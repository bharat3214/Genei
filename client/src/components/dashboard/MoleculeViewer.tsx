import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface MoleculeViewerProps {
  smiles?: string;
  name?: string;
  formula?: string;
}

export default function MoleculeViewer({ 
  smiles = "CC(=O)OC1=CC=CC=C1C(=O)O", 
  name = "Aspirin", 
  formula = "C9H8O4" 
}: MoleculeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayMode, setDisplayMode] = useState("ballAndStick");
  const [colorScheme, setColorScheme] = useState("element");
  const [isLoading, setIsLoading] = useState(true);
  const [RDKit, setRDKit] = useState<any>(null);

  useEffect(() => {
    const loadRDKit = async () => {
      try {
        if (window.RDKit) {
          setRDKit(window.RDKit);
          setIsLoading(false);
        } else if (window.initRDKit) {
          const rdkitInstance = await window.initRDKit();
          setRDKit(rdkitInstance);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load RDKit:", error);
        setIsLoading(false);
      }
    };
    
    loadRDKit();
  }, []);

  useEffect(() => {
    if (!RDKit || !smiles || !canvasRef.current) return;
    
    try {
      // Clear the canvas
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw the molecule
      const mol = RDKit.get_mol(smiles);
      
      if (mol) {
        const drawer = new RDKit.MolDraw2DCairo(canvasRef.current.width, canvasRef.current.height);
        
        // Apply drawing options based on display mode and color scheme
        const drawOptions = drawer.drawOptions();
        
        // Set drawing options based on selected display mode
        switch (displayMode) {
          case "ballAndStick":
            drawOptions.atomLabelFontSize = 16;
            break;
          case "stick":
            drawOptions.atomLabelFontSize = 12;
            break;
          case "wireframe":
            drawOptions.bondLineWidth = 1;
            break;
        }
        
        drawer.drawMolecule(mol);
        drawer.finishDrawing();
        
        // Get the PNG data and draw it on the canvas
        const pngData = drawer.getDrawingText();
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = "data:image/png;base64," + pngData;
        
        // Free memory
        mol.delete();
        drawer.delete();
      }
    } catch (error) {
      console.error("Error rendering molecule:", error);
    }
  }, [RDKit, smiles, displayMode, colorScheme]);

  // Handle rotation
  const handleRotate = () => {
    // In a real implementation, this would apply a transformation to the 3D model
    console.log("Rotate molecule");
  };

  // Handle zoom
  const handleZoom = () => {
    // In a real implementation, this would zoom in/out the 3D model
    console.log("Zoom molecule");
  };

  // Handle export
  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${name || 'molecule'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Molecule Visualization</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <span className="material-icons text-sm mr-1">rotate_90_degrees_ccw</span>
              Rotate
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoom}>
              <span className="material-icons text-sm mr-1">zoom_in</span>
              Zoom
            </Button>
            <Button variant="default" size="sm" onClick={handleExport}>
              <span className="material-icons text-sm mr-1">download</span>
              Export
            </Button>
          </div>
        </div>
        
        {/* Molecule Visualization Canvas */}
        <div className="h-96 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
          {isLoading ? (
            <Skeleton className="h-64 w-64 rounded-md" />
          ) : RDKit ? (
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={300} 
              className="max-h-64 mx-auto"
            />
          ) : (
            <div className="text-center p-6 space-y-4">
              <div className="text-gray-500">
                RDKit visualization not available
              </div>
              <p className="text-sm text-gray-500">{name} ({formula})</p>
            </div>
          )}
        </div>
        
        {/* Visualization Controls */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <Label htmlFor="display-mode" className="block text-sm font-medium text-gray-700 mr-2">
              Display:
            </Label>
            <Select value={displayMode} onValueChange={setDisplayMode}>
              <SelectTrigger className="w-[160px]" id="display-mode">
                <SelectValue placeholder="Ball and Stick" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ballAndStick">Ball and Stick</SelectItem>
                <SelectItem value="stick">Stick</SelectItem>
                <SelectItem value="sphere">Sphere</SelectItem>
                <SelectItem value="wireframe">Wireframe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <Label htmlFor="color-scheme" className="block text-sm font-medium text-gray-700 mr-2">
              Color:
            </Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger className="w-[160px]" id="color-scheme">
                <SelectValue placeholder="Element" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="element">Element</SelectItem>
                <SelectItem value="residue">Residue</SelectItem>
                <SelectItem value="chain">Chain</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

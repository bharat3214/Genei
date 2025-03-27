import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Molecule } from "@/lib/types";

interface MoleculeDisplayProps {
  molecule?: Molecule;
  isLoading?: boolean;
}

export default function MoleculeDisplay({ molecule, isLoading = false }: MoleculeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!molecule?.smiles || !canvasRef.current || !window.RDKit) return;
    
    try {
      // Clear the canvas
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw the molecule
      const mol = window.RDKit.get_mol(molecule.smiles);
      
      if (mol) {
        const drawer = new window.RDKit.MolDraw2DCairo(canvasRef.current.width, canvasRef.current.height);
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
  }, [molecule]);

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>{molecule?.name || "Molecule"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : molecule ? (
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-gray-50 flex justify-center">
              {window.RDKit ? (
                <canvas 
                  ref={canvasRef} 
                  width={300} 
                  height={200} 
                  className="max-w-full"
                />
              ) : (
                <div className="text-gray-500 py-10">RDKit visualization not available</div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Formula</h3>
                <p className="text-lg font-mono">{molecule.formula || "Unknown"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Molecular Weight</h3>
                <p className="text-lg">{molecule.molecularWeight?.toFixed(2) || "Unknown"} g/mol</p>
              </div>
              
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500">SMILES</h3>
                <p className="text-xs font-mono break-all">{molecule.smiles}</p>
              </div>
              
              {molecule.inchiKey && (
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">InChI Key</h3>
                  <p className="text-xs font-mono">{molecule.inchiKey}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No molecule selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import pcbnew,json,shutil,os,argparse
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--out',required=True,type=Path);args=parser.parse_args();args.out.mkdir(parents=True,exist_ok=True)
ROOT=Path(__file__).resolve().parents[4]
b=pcbnew.LoadBoard(str(ROOT/'archive/hardware/soldering-board-1/soldering_board_1.kicad_pcb'))
folder=args.out/'component-models';folder.mkdir(exist_ok=True)
lib=Path('/Applications/KiCad/KiCad.app/Contents/SharedSupport/3dmodels');entries=[]
for f in b.GetFootprints():
 models=list(f.Models());pos=f.GetPosition()
 for m in models:
  rel=m.m_Filename.split('}/')[1];src=lib/rel;dst=folder/src.name;shutil.copy2(src,dst)
  entries.append({'ref':f.GetReference(),'value':f.GetValue(),'file':'component-models/'+src.name,'position':[pcbnew.ToMM(pos.x)-104.902,134.112-pcbnew.ToMM(pos.y),0.8],'angle':f.GetOrientationDegrees()})
(args.out/'components.json').write_text(json.dumps(entries))
print('Placed models:',len(entries))

for n in [14,18]:
 src=lib/'Connector_PinSocket_2.54mm.3dshapes'/f'PinSocket_1x{n}_P2.54mm_Vertical.wrl';shutil.copy2(src,folder/src.name)
# Export board surfaces alone; component WRLs are placed separately in JS.
for f in b.GetFootprints():f.Models().clear()
exporter=pcbnew.EXPORTER_VRML(b)
assert exporter.ExportVRML_File(b.GetProject(),'',str(args.out/'board.wrl'),1.0,False,False,'',104.902,134.112)

# Geometric tessellation of the instructor's STEP, with teaching colors.
import sys,json
from pathlib import Path
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--out',required=True,type=Path);args=parser.parse_args();args.out.mkdir(parents=True,exist_ok=True)
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,'/Applications/FreeCAD.app/Contents/Resources/lib')
import FreeCAD,Part
shape=Part.Shape();shape.read(str(ROOT/'archive/hardware/soldering-board-1/models/DFR0654.step'))
parts=[]
for i,solid in enumerate(shape.Solids):
 bb=solid.BoundBox
 if bb.XLength>24 and bb.ZLength>59 and bb.YLength<2:color='#185b31' # module PCB
 elif bb.YMax<=1.61:color='#d1ad52' # contact plating
 elif bb.XLength>12 and bb.ZLength>12 and bb.YLength>1:color='#a5aab1' # RF shield
 elif bb.ZMin<-27 and bb.YLength>2:color='#b8bdc5' # USB shell
 elif max(bb.XLength,bb.ZLength)>3:color='#292d34'
 else:color='#76787d'
 vertices,faces=solid.tessellate(.08)
 parts.append({'name':'DFR0654-part-'+str(i),'color':color,'position':[round(float(c),5) for v in vertices for c in v],'index':[j for f in faces for j in f]})
(args.out/'module.json').write_text(json.dumps(parts,separators=(',',':')))
print('Solids',len(parts),'triangles',sum(len(p['index'])//3 for p in parts),flush=True)

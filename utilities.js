

function rangeFun(input,type,r1,r2) {		
    	
    if (type == "between"){		
      if(r1<r2){		
        if ((input>r1)&&(input<r2)){		
          return true;		
        }else {		
          return false;		
        }		
      }else {		
        if ((input>r2)&&(input<r1)){		
          return true;		
        }else {		
          return false;		
        }		
      }		
    }else {		
      if(r1<r2){		
        if ((input<r1)||(input>r2)){		
          return true;		
        }else {		
          return false;		
        }		
      }else {		
        if ((input<r2)||(input>r1)){		
          return true;		
        }else {		
          return false;		
        }		
      }		
    }		
  };

function coordsToZone(x, y){
    
    if (y<17){
        return "forehead";
    }else if (rangeFun(y,"between",17,56) && rangeFun(x,"between", 15, 85)){
        return "eye";
    }else if (rangeFun(y,"between",65,77) && rangeFun(x,"between", 25, 75)){
        return "mouth";
    }else if (rangeFun(x,"between",0,15)){
        return "left";
    }else if (rangeFun(x,"between",85,100)){
        return "right";
    }else if (rangeFun(y,"between",77,100) && rangeFun(x,"between", 15, 85)){
        return "chin";
    }
}
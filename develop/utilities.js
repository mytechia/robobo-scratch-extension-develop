/*******************************************************************************
 * Copyright 2016 Mytech Ingenieria Aplicada <http://www.mytechia.com>
 * Copyright 2016 Luis Llamas <luis.llamas@mytechia.com>
 * Copyright 2016 Gervasio Varela <gervasio.varela@mytechia.com>
 * <p>
 * This file is part of Robobo Scratch Extension.
 * <p>
 * Robobo Scratch Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p>
 * Robobo Scratch Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License
 * along with Robobo Scratch Extension.  If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/


 /** Checks whether a value is inside an specified range */
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
  
  function scratchToRoboboAngle(angle){
    return angle +180;
  }

  function roboboToScratchAngle(angle){
    return angle -180;
  }
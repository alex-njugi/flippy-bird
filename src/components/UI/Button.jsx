import React from "react";
export default function Button({children, className="", ...rest}){
  return <button {...rest} className={"bg-gradient-to-r from-[#7b61ff] to-[#ff6ad5] text-white small-btn " + className}>{children}</button>
}

import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return {name:"CertifyHub",short_name:"CertifyHub",description:"Aprende para tus certificaciones Microsoft",start_url:"/",display:"standalone",background_color:"#101023",theme_color:"#111029",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]}; }

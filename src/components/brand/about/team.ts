import sandra from "./assets/sandra.png?url";
import victor from "./assets/victor.png?url";
import jonathan from "./assets/jonathan.png?url";
import isabella from "./assets/isabella.png?url";
import nikita from "./assets/nikita.png?url";

// Names verified against nuroai.dev/team; portraits supplied in Downloads/nuro-imgs.
export const team = [
  { id: "sandra", name: "Sandra Hilltomt", image: sandra },
  { id: "victor", name: "Victor Wallander", image: victor },
  { id: "jonathan", name: "Jonathan Olsen", image: jonathan },
  { id: "isabella", name: "Isabella Sällfors", image: isabella },
  { id: "nikita", name: "Nikita Stense", image: nikita },
] as const;

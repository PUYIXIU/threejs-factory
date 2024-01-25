import {Path, Vector3} from "yuka";

const YELLOWVEHICLEPATHs = []

const yellowV1 = new Path()
yellowV1.loop = true
yellowV1.add(new Vector3(95, 0, 25))
yellowV1.add(new Vector3(100, 0, 15))
yellowV1.add(new Vector3(100, 0, -65))
yellowV1.add(new Vector3(95, 0, 75))
yellowV1.add(new Vector3(10, 0, -75))
yellowV1.add(new Vector3(0, 0, -70))
yellowV1.add(new Vector3(0, 0, 20))
yellowV1.add(new Vector3(10, 0, 25))

YELLOWVEHICLEPATHs.push(yellowV1)

export {
    YELLOWVEHICLEPATHs
}
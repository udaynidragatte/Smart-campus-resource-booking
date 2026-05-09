const classroomImages = [
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
];

const labImages = [
  "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1581093458791-9d15482442f6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80"
];

const seminarImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80"
];

const courtImages = [
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80"
];

const statusCycle = ["Available", "Pending", "Booked", "Available", "Available"];
const projectorCycle = ["Working properly", "Working properly", "Needs maintenance", "Working properly", "Unavailable"];

function makeResources({ count, startId, type, namePrefix, locationPrefix, images, amenities, baseCapacity }) {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return {
      id: startId + index,
      name: type === "Classroom" ? `Classroom ${number}` : type === "Lab" ? `CS Lab ${number}` : `${namePrefix} ${number}`,
      type,
      capacity: baseCapacity + ((index % 5) * 8),
      status: statusCycle[index % statusCycle.length],
      location: `${locationPrefix}, Floor ${(index % 5) + 1}`,
      image: images[index % images.length],
      amenities: amenities[index % amenities.length],
      utilization: 35 + ((index * 7) % 60),
      projectorStatus: type === "Classroom" ? projectorCycle[index % projectorCycle.length] : "Not applicable"
    };
  });
}

export const resources = [
  ...makeResources({
    count: 50,
    startId: 1,
    type: "Classroom",
    namePrefix: "Smart Classroom",
    locationPrefix: "Academic Block",
    images: classroomImages,
    amenities: [
      ["Smart Board", "Projector", "WiFi"],
      ["Whiteboard", "Podium", "AC"],
      ["Projector", "Recording", "WiFi"]
    ],
    baseCapacity: 48
  }),
  ...makeResources({
    count: 30,
    startId: 101,
    type: "Lab",
    namePrefix: "Innovation Lab",
    locationPrefix: "Research Block",
    images: labImages,
    amenities: [
      ["GPU Workstations", "Projector", "High-speed WiFi"],
      ["Lab Benches", "Safety Kit", "Whiteboard"],
      ["3D Printer", "IoT Kits", "AC"]
    ],
    baseCapacity: 32
  }),
  ...makeResources({
    count: 7,
    startId: 201,
    type: "Seminar Hall",
    namePrefix: "Seminar Hall",
    locationPrefix: "Admin Block",
    images: seminarImages,
    amenities: [
      ["Stage", "Audio System", "Recording"],
      ["Projector", "AC", "Podium"],
      ["Lighting", "Green Room", "Live Stream"]
    ],
    baseCapacity: 120
  }),
  ...makeResources({
    count: 5,
    startId: 301,
    type: "Court",
    namePrefix: "Sports Court",
    locationPrefix: "Sports Complex",
    images: courtImages,
    amenities: [
      ["Floodlights", "Changing Room", "Scoreboard"],
      ["Indoor Lighting", "Wooden Floor", "Seating"],
      ["Equipment Desk", "First Aid", "Water Station"]
    ],
    baseCapacity: 16
  })
];

resources[80].name = "Seminar Hall A";
resources[87].name = "Basketball Court";

export const bookings = [
  { id: "BK-1024", resource: "CS Lab 1", user: "Aarav Mehta", role: "Faculty", start: "2026-05-10 10:00", end: "2026-05-10 12:00", purpose: "ML workshop", status: "Approved" },
  { id: "BK-1025", resource: "Seminar Hall A", user: "Neha Sharma", role: "Student", start: "2026-05-10 14:00", end: "2026-05-10 16:00", purpose: "Club orientation", status: "Pending" },
  { id: "BK-1026", resource: "Basketball Court", user: "Rohan Iyer", role: "Student", start: "2026-05-11 17:00", end: "2026-05-11 18:30", purpose: "Inter-department practice", status: "Approved" },
  { id: "BK-1027", resource: "Classroom 1", user: "Dr. Kavya Rao", role: "Faculty", start: "2026-05-12 09:00", end: "2026-05-12 11:00", purpose: "Guest lecture", status: "Rejected" }
];

export const chartData = [
  { day: "Mon", bookings: 18, utilization: 62 },
  { day: "Tue", bookings: 24, utilization: 73 },
  { day: "Wed", bookings: 32, utilization: 81 },
  { day: "Thu", bookings: 27, utilization: 76 },
  { day: "Fri", bookings: 38, utilization: 88 },
  { day: "Sat", bookings: 15, utilization: 46 }
];

export const peakHours = [
  { hour: "8 AM", usage: 22 },
  { hour: "10 AM", usage: 68 },
  { hour: "12 PM", usage: 54 },
  { hour: "2 PM", usage: 86 },
  { hour: "4 PM", usage: 72 },
  { hour: "6 PM", usage: 44 }
];

export const calendarEvents = bookings.map((booking) => ({
  title: `${booking.resource} - ${booking.status}`,
  start: booking.start.replace(" ", "T"),
  end: booking.end.replace(" ", "T"),
  backgroundColor: booking.status === "Approved" ? "#0f766e" : booking.status === "Pending" ? "#f59e0b" : "#ef4444",
  borderColor: "transparent"
}));

export const principalStatus = {
  name: "Dr. Meera Krishnan",
  role: "Principal",
  isOnCampus: true,
  location: "Administration Block, Principal Office",
  lastUpdated: "Today, 12:55 PM",
  nextAvailableSlot: "2:30 PM - 3:15 PM",
  notes: "Available for approved student/faculty appointments after lunch."
};

export const campusBuses = [
  {
    id: "BUS-01",
    name: "Bus 1",
    route: "Hostel Loop",
    driver: "Ravi Kumar",
    status: "On Route",
    eta: "6 min",
    speed: "28 km/h",
    occupancy: "34/48",
    latitude: 17.445,
    longitude: 78.349,
    nextStop: "Library Gate",
    stops: ["Main Gate", "Admin Block", "Library Gate", "Hostel A", "Sports Complex"]
  },
  {
    id: "BUS-02",
    name: "Bus 2",
    route: "City Pickup",
    driver: "Anita Rao",
    status: "Delayed",
    eta: "14 min",
    speed: "18 km/h",
    occupancy: "41/48",
    latitude: 17.452,
    longitude: 78.356,
    nextStop: "Main Gate",
    stops: ["City Stop", "Metro Point", "Main Gate", "Academic Block", "Labs Block"]
  },
  {
    id: "BUS-03",
    name: "Bus 3",
    route: "Labs Express",
    driver: "Suresh Nair",
    status: "Arriving",
    eta: "2 min",
    speed: "12 km/h",
    occupancy: "22/42",
    latitude: 17.441,
    longitude: 78.346,
    nextStop: "Research Block",
    stops: ["Main Gate", "CSE Block", "Research Block", "Seminar Hall", "Parking Bay"]
  }
];
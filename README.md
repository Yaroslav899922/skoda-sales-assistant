# 🚗 Škoda AI Sales Assistant

![Status](https://img.shields.io/badge/Status-Live_Prototype-success)
![AI Model](https://img.shields.io/badge/AI-Gemini_1.5_Pro-purple)
![Platform](https://img.shields.io/badge/Cloud-Google_Cloud_Run-blue)

## 📖 About The Project

**Škoda AI Sales Assistant** is a specialized web application developed to optimize the workflow of automotive sales managers.

I created this project as a **Proof of Concept (PoC)** to demonstrate how Multimodal AI can be integrated into real-world dealership processes. The goal was to reduce the time spent on vehicle inspection and content creation for marketplaces.

> *"Bridging the gap between Automotive Sales expertise and Generative AI."*

## 🛠 Key Features

1.  **Instant Vision Analysis:** Upload photos of a car directly from a smartphone. The AI identifies the model, detects visual defects, and assesses tire condition.
2.  **Automated Listing Generation:** Creates marketing descriptions tailored for different platforms (Instagram, Auto.ria) with a single click.
3.  **Digital Inspection Report:** Generates a structured summary including VIN, mileage, and trim level analysis.
4.  **Mobile-First Architecture:** Specifically optimized for stability on iOS/Android devices to ensure smooth operation on the dealership lot.

## 🧰 Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS
* **AI Engine:** Google Gemini 1.5 Pro (Multimodal Vision capabilities)
* **Infrastructure:** Google Cloud Run (Serverless deployment)
* **Storage:** Browser LocalStorage (Session management)

## 🧩 Technical Highlights

Solving the "Mobile Memory Limit" on iOS was a key challenge.
* Implemented **Client-side Image Optimization** to handle high-res photos from modern smartphones.
* Developed a **Lightweight History System** that prevents browser crashes by managing storage quotas intelligently (storing data references instead of heavy blobs).
* Built a **Fail-safe UI** that handles network instability during on-site inspections.

## 🚀 Usage

This tool is designed for internal use by sales staff:
1.  Take photos of the incoming trade-in vehicle.
2.  Upload to the Assistant.
3.  Receive a ready-to-use technical report and marketing text within 30 seconds.

## 👤 Author

**Yaroslav Mykhailov**
*Head of Sales Dept. | Automotive Expert | Tech Enthusiast*

---
*Developed for research and process optimization purposes.*

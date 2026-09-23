🔗 **Playlist:**

[▶️ Mission Planner | A HOW TO Guide (2019)](https://www.youtube.com/playlist?list=PLgiealSjeVyyX7AL53Nv69T3vUlk79PUR)

---

# 🛰️ Mission Planner — A HOW TO Guide

> A practical video series for learning how to use Mission Planner with ArduPilot.

## 📚 Overview

This playlist focuses on the practical use of **Mission Planner**, the Ground Control Station (GCS) commonly used with ArduPilot.

The goal is to understand how to configure, monitor, test, and operate an ArduPilot-based vehicle through Mission Planner.

---

## 🎯 What You Will Learn

- Mission Planner interface
- Connecting a flight controller
- Vehicle configuration
- Sensor setup and calibration
- Parameters
- Flight modes
- Radio configuration
- GPS configuration
- Compass configuration
- Flight controller setup
- Mission planning
- Vehicle monitoring
- Logs and troubleshooting
- Practical ArduPilot configuration

---

## 🧠 Main Topics

### 1. Mission Planner Basics

Understand:

- What Mission Planner is
- What it is used for
- Main interface
- Connecting to the flight controller
- Communication with ArduPilot

---

### 2. Hardware Setup

Learn how Mission Planner interacts with:

- Flight Controller
- GPS
- Compass
- IMU
- RC Receiver
- Telemetry
- Motors / Servos

Basic architecture:

```text
                 Mission Planner
                       │
                  MAVLink
                       │
                       ↓
                Flight Controller
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
         GPS         Sensors      RC Receiver
          │            │
          └────────────┴────────────┘
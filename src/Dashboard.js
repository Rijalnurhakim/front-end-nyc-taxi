import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [trips, setTrips] = useState([]);
    const [filters, setFilters] = useState({
        fareMin: '',
        fareMax: '',
        distanceMin: '',
        distanceMax: '',
        time: ''
    });

    // Gunakan environment variable untuk URL backend
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await axios.get(`${backendURL}/api/trips`,     {
                params: {
                    fare_min: filters.fareMin,
                    fare_max: filters.fareMax,
                    distance_min: filters.distanceMin,
                    distance_max: filters.distanceMax,
                    time: filters.time
                }
            });
            setTrips(response.data);
        } catch (error) {
            console.error('Error fetching trips:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const generateChartData = () => {
        const fareRanges = {
            "Fare 5-10": 0,
            "Fare 10-20": 0,
            "Fare 20+": 0
        };

        trips.forEach(trip => {
            const fare = parseFloat(trip.fare_amount);
            if (fare >= 5 && fare < 10) {
                fareRanges["Fare 5-10"]++;
            } else if (fare >= 10 && fare < 20) {
                fareRanges["Fare 10-20"]++;
            } else if (fare >= 20) {
                fareRanges["Fare 20+"]++;
            }
        });

        return {
            labels: Object.keys(fareRanges),
            datasets: [{
                label: 'Number of Trips',
                data: Object.values(fareRanges),
                backgroundColor: ['#3b82f6', '#10b981', '#ef4444']
            }]
        };
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">NYC Yellow Taxi Dashboard</h1>

            {/* Filter Section */}
            <div className="bg-white shadow-lg rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
                <input type="number" name="fareMin" placeholder="Fare Min" className="p-2 border rounded" onChange={handleFilterChange} />
                <input type="number" name="fareMax" placeholder="Fare Max" className="p-2 border rounded" onChange={handleFilterChange} />
                <input type="number" name="distanceMin" placeholder="Distance Min" className="p-2 border rounded" onChange={handleFilterChange} />
                <input type="number" name="distanceMax" placeholder="Distance Max" className="p-2 border rounded" onChange={handleFilterChange} />
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={fetchTrips}>Apply Filter</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Peta */}
                <div className="bg-white shadow-lg rounded-xl p-4">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Trip Map</h2>
                    <MapContainer center={[40.7128, -74.006]} zoom={12} style={{ height: "400px", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {trips.slice(0, 10).map((trip, index) => (
                            trip.pickup_latitude && trip.pickup_longitude ? (
                                <Marker key={index} position={[trip.pickup_latitude, trip.pickup_longitude]} />
                            ) : null
                        ))}
                    </MapContainer>
                </div>

                {/* Grafik */}
                <div className="bg-white shadow-lg rounded-xl p-4 flex flex-col items-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Trip Statistics</h2>
                    <div className="w-full h-80">
                        <Bar data={generateChartData()} />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Dashboard;

import React, { Component } from 'react';
import './Inventory.css';
import { callApi } from './api';

class Inventory extends Component {
    constructor() {
        super();
        this.state = { inventory: {} };
    }

    componentDidMount() {
        this.loadInventory();
    }

    loadInventory = () => {
        callApi("GET", "http://localhost:8080/requests/inventory", "", (response) => {
            if (response.includes("401::")) {
                alert(response.split("::")[1]);
                return;
            }
            const data = JSON.parse(response);
            this.setState({ inventory: data });
        });
    }

    render() {
        const { inventory } = this.state;
        return (
            <div className="inventory-container">
                <h2>Blood Inventory</h2>
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Blood Group</th>
                            <th>Units Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(inventory).map(([bg, count]) => (
                            <tr key={bg}>
                                <td>{bg}</td>
                                <td>{count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Inventory;

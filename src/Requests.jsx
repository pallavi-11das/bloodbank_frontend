import React, { Component } from 'react';
import './Requests.css';
import { callApi } from './api';

class Requests extends Component {
    constructor() {
        super();
        this.state = {
            id: '',
            name: '',
            organisation: '',
            location: '',
            bloodgroup: '',
            rhfactor: '',
            medicalhistory: '',
            status: 'pending',
            joblist: [],
            inventory: {}
        };
    }

    componentDidMount() {
        this.loadInventoryAndRequests();
    }

    loadInventoryAndRequests = () => {
        callApi("GET", "http://localhost:8080/requests/inventory", "", (invResponse) => {
            if (invResponse.includes("401::")) {
                alert(invResponse.split("::")[1]);
                return;
            }
            const inventory = JSON.parse(invResponse);
            this.setState({ inventory }, this.loadRequests);
        });
    }

    loadRequests = () => {
        callApi("GET", "http://localhost:8080/requests/readrequest", "", (res) => {
            if (res.includes("401::")) { alert(res.split("::")[1]); return; }

            let joblist = JSON.parse(res);
            // Automatically accept requests if units available
            joblist = joblist.map(r => {
                const key = r.bloodgroup + r.rhfactor;
                const available = this.state.inventory[key] || 0;
                if (r.status === 'pending' && available > 0) {
                    r.status = 'accepted';
                    this.state.inventory[key] = available - 1;
                    // Optionally, update backend for accepted status
                    callApi("PUT", `http://localhost:8080/requests/accept/${r.id}`, "", () => {});
                }
                return r;
            });

            this.setState({ joblist });
        });
    }

    loadInputChange = (e) => this.setState({ [e.target.name]: e.target.value });

    saveRequest = () => {
        const data = JSON.stringify({ ...this.state, status: "pending" });
        const url = this.state.id
            ? "http://localhost:8080/requests/update"
            : "http://localhost:8080/requests/insert";

        callApi(this.state.id ? "PUT" : "POST", url, data, this.afterSave);
    }

    afterSave = (res) => {
        alert(res.split("::")[1]);
        this.setState({
            id: '', name: '', organisation: '', location: '',
            bloodgroup: '', rhfactor: '', medicalhistory: '', status: 'pending'
        });
        this.closePopup();
        this.loadInventoryAndRequests();
    }

    showPopUp = () => document.getElementById("jppopup").style.display = "block";
    closePopup = () => document.getElementById("jppopup").style.display = "none";

    updateRequest = (id) => {
        callApi("GET", "http://localhost:8080/requests/getrequest/" + id, "", (res) => {
            if (res.includes("401::")) { alert(res.split("::")[1]); return; }
            this.setState({ ...JSON.parse(res) });
            this.showPopUp();
        });
    }

    deleteRequest = (id) => {
        if (!window.confirm("Are you sure?")) return;
        callApi("DELETE", "http://localhost:8080/requests/delete/" + id, "", this.afterSave);
    }

    render() {
        const { joblist } = this.state;
        return (
            <div className='JPContainer'>
                {/* Popup form */}
                <div id='jppopup' className='popup'>
                    <div className='popupwindow'>
                        <div className='popupheader'>
                            <label>{this.state.id ? "Update Request" : "New Request"}</label>
                            <span onClick={this.closePopup}>&times;</span>
                        </div>
                        <div className='popupcontent'>
                            <label>Name*</label>
                            <input type='text' name='name' value={this.state.name} onChange={this.loadInputChange} />
                            <label>Organisation*</label>
                            <input type='text' name='organisation' value={this.state.organisation} onChange={this.loadInputChange} />
                            <label>Location*</label>
                            <input type='text' name='location' value={this.state.location} onChange={this.loadInputChange} />
                            <label>Blood Group*</label>
                            <select name='bloodgroup' value={this.state.bloodgroup} onChange={this.loadInputChange}>
                                <option value="">Select</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="AB">AB</option>
                                <option value="O">O</option>
                            </select>
                            <label>RH Factor*</label>
                            <input type='text' name='rhfactor' value={this.state.rhfactor} onChange={this.loadInputChange} />
                            <label>Medical History*</label>
                            <textarea name='medicalhistory' value={this.state.medicalhistory} onChange={this.loadInputChange}></textarea>
                            <button onClick={this.saveRequest}>Save</button>
                        </div>
                    </div>
                </div>

                {/* Requests list */}
                <div className='header'><label>All Requests</label></div>
                <div className='content'>
                    {joblist.map(d => (
                        <div key={d.id} className='result'>
                            <div className='div1'>
                                <label>{d.name}</label>
                                <label id='bg'>{d.bloodgroup}</label>
                                <span>{d.rhfactor}</span>
                                <img src="/edit.png" alt="Edit" onClick={() => this.updateRequest(d.id)} />
                                <img src="/delete.png" alt="Delete" onClick={() => this.deleteRequest(d.id)} />
                            </div>
                            <div className='div2'>
                                <label>{d.organisation}</label>
                                <label>{d.location}</label>
                            </div>
                            <div className='div3'>
                                <label>{d.medicalhistory}</label>
                            </div>
                            <div className='div4'>
                                <strong>Status: </strong><span>{d.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='footer'>
                    <button onClick={this.showPopUp}>Add Request</button>
                </div>
            </div>
        );
    }
}

export default Requests;

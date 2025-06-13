import React, { useEffect, useState } from "react";
import Side_nav from "../Side_nav";
import { Token } from "../Token";
import Employee_card from "../Employee_card";
import "../../style/employee.css";
import { Modal, Button, Form, SelectPicker, InputGroup, Input } from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import BASE_URL from "../url";

function Employees() {
  const { decode, token } = Token();
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [managers, setManagers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    password: "",
    manager_id: "",
    emp_type_id: "",
  });

  console.log(employees);
  useEffect(() => {
    if (!decode?.id) return;

    fetch(`http://localhost:1110/mappedusers/${decode.id}/${decode.role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        setEmployees(data);
        setFilteredEmployees(data);
      })
      .catch((error) => console.log(error));
  }, [decode.id, decode.role, token]);

  useEffect(() => {
    if (!decode?.id) return;
  
    fetch(`http://localhost:1110/mappedusers/${decode.id}/${decode.role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployees(data);
          setFilteredEmployees(data);
        } else {
          setEmployees([]);
          setFilteredEmployees([]);
          console.warn("Unexpected data format:", data);
        }
      })
      .catch((error) => console.log(error));
  }, [decode.id, decode.role, token]);

  const openModal = async () => {
    setShowModal(true);

    try {
      const [managerRes, roleRes] = await Promise.all([
        fetch(`${BASE_URL}/list/managers`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),

        fetch(`${BASE_URL}/list/employee-types`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const managersData = await managerRes.json();
      const rolesData = await roleRes.json();

      setManagers(
        managersData.map((m) => ({
          label: m.name,
          value: m.value,
          role: m.role,
        }))
      );
      setRoles(rolesData.map((r) => ({ label: r.label, value: r.value })));
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };

  const handleSubmit = async () => {
    console.log(formData, "data !");
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log(result, "response ! ");
      if (result) {
        setShowModal(false);
      } else {
        console.log("Failed to add an user !");
      }
    } catch (err) {
      console.error(err);
    }
  };
  console.log(managers, "managers !");
  return (
    <div className="width employees-container">
      <Side_nav />
      <div className="grid">
        <div
          className={
            decode.role == "HR" || decode.role == "ADMIN"
              ? "hr-header-content"
              : "employees-header-content"
          }
        >
          <div className="total-employees">
            Employee Directory
            <div className="total-employees-count">
              Total Employees count : {employees.length}
            </div>
          </div>
          {decode.role === "HR" && (
            <div className="add-employee">
              <button onClick={openModal}>+ Employee</button>
            </div>
          )}

          <Modal open={showModal} onClose={() => setShowModal(false)} size="sm">
            <Modal.Header>
              <Modal.Title>Add New Employee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form fluid onChange={setFormData} formValue={formData}>
                <div className="form-row">
                  <Form.Group>
                    <Form.ControlLabel>Name</Form.ControlLabel>
                    <Form.Control name="name"  placeholder="Enter name..."/>
                  </Form.Group>

                  <Form.Group>
                    <Form.ControlLabel>Contact No</Form.ControlLabel>
                    <Form.Control name="contact_number" type="text" placeholder="+91 _ _ _ _"/>
                  </Form.Group>
                </div>

                <div className="form-row">
                  <Form.Group>
                    <Form.ControlLabel>Email</Form.ControlLabel>
                    <Form.Control name="email" type="email" placeholder="email@gmail.com" />
                  </Form.Group>

                  <Form.Group>
                    <Form.ControlLabel>Password</Form.ControlLabel>
                    <Form.Control name="password" type="password" placeholder="Password.."/>
                  </Form.Group>
                </div>

                <div className="select-picker-group">
                <Form.Group>
                  <Form.ControlLabel>Manager</Form.ControlLabel>
                  <SelectPicker
                    data={managers.map((m) => ({
                      value: m.value,
                      label: `${m.label} (${m.role})`,
                    }))}
                    name="manager_id"
                    style={{ width: "100%" }}
                    placeholder="Select a manager"
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, manager_id: value }))
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.ControlLabel>Employee Type</Form.ControlLabel>
                  <SelectPicker
                    data={roles}
                    name="emp_type_id"
                    value={formData.emp_type_id}
                    style={{ width: "100%" }}
                    placeholder="Select employee type"
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, emp_type_id: value }))
                    }
                  />
                </Form.Group>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowModal(false)} appearance="subtle">
                Cancel
              </Button>
              <Button onClick={handleSubmit} appearance="primary">
                Submit
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
        <div className="search-container" style={{ padding: "10px 0" }}>
          <InputGroup style={{ width: 300 }}>
            <Input
              placeholder="Search by name, email, role..."
              value={searchValue}
              onChange={setSearchValue}
            />
            <InputGroup.Addon>
              <SearchIcon />
            </InputGroup.Addon>
          </InputGroup>
        </div>
        {filteredEmployees.length > 0 ? (
          <Employee_card data={filteredEmployees} />
        ) : (
          <div
            style={{
              padding: "20px",
              fontSize: "16px",
              color: "#888",
              textAlign: "center",
            }}
          >
            No results found !
          </div>
        )}
      </div>
    </div>
  );
}

export default Employees;

import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import {
    BsGeoAlt,
    BsEye,
    BsHeartFill,
    BsTrash,
} from "react-icons/bs";
import Handler from "../../Helpers/Handler";

import { useFavourite } from "../../Context/FavouriteProvider";

const Favourite = () => {
    const { favourites: favData, loading, toggleFavorite } = useFavourite();
    const [removingId, setRemovingId] = useState(null);

    // ✅ Modal State
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const navigate = useNavigate();

    /* ==============================
       OPEN DELETE MODAL
    ============================== */
    const openDeleteModal = (property) => {
        setSelectedProperty(property);
        setDeleteModal(true);
    };

    /* ==============================
       CONFIRM REMOVE
    ============================== */
    const confirmRemoveFavourite = async () => {
        if (!selectedProperty) return;

        try {
            setRemovingId(selectedProperty.property_id);
            await toggleFavorite(selectedProperty);
            setDeleteModal(false);
            setSelectedProperty(null);
        } catch (error) {
            console.error("Remove favourite error:", error);
        } finally {
            setRemovingId(null);
        }
    };

    /* ==============================
       UI
    ============================== */
    return (
        <section className="py-5 bg-light min-vh-100">
            <Container>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold">
                        <BsHeartFill className="text-danger me-2" />
                        My Favourite Properties
                    </h3>
                    <span className="text-muted">{favData.length} Saved</span>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner color="primary" />
                    </div>
                ) : favData.length === 0 ? (
                    <div className="text-center py-5">
                        <BsHeartFill size={60} className="text-muted mb-3" />
                        <h5>No Favourite Properties Found</h5>
                        <Button
                            color="primary"
                            className="mt-3"
                            onClick={() => navigate("/search-property")}
                        >
                            Browse Properties
                        </Button>
                    </div>
                ) : (
                    <Row>
                        {favData && favData?.map((item) => (
                            <Col md="4" sm="6" xs="12" key={item.property_id} className="mb-4">
                                <Card className="shadow-sm border-0 h-100 favourite-card">
                                    <div className="position-relative">
                                        <img
                                            src={"https://fastly.picsum.photos/id/411/5000/2358.jpg?hmac=YjkATffpMa8rh663_FXDsGY0W-Y0hAPfqpjXZoP65hQ" ||
                                                `https://example.com/properties/${item.property_thumbnail}`
                                            }
                                            alt={item.property_name}
                                            className="w-100"
                                            style={{
                                                height: "220px",
                                                objectFit: "cover",
                                                borderTopLeftRadius: "10px",
                                                borderTopRightRadius: "10px",
                                            }}
                                        />

                                        {/* ✅ Open Modal Instead of Direct Delete */}
                                        <Button
                                            size="sm"
                                            color="danger"
                                            className="position-absolute top-0 end-0 m-2 rounded-circle"
                                            onClick={() => openDeleteModal(item)}
                                        >
                                            <BsTrash />
                                        </Button>
                                    </div>

                                    <CardBody>
                                        <h5 className="fw-bold mb-2">{item.property_name}</h5>

                                        <p className="text-muted mb-2">
                                            <BsGeoAlt className="me-1" />
                                            {item.property_address}
                                        </p>

                                        <h6 className="text-primary fw-bold mb-3">
                                            ₹ {Number(item.price).toLocaleString()}
                                        </h6>

                                        <Button
                                            color="secondary"
                                            className="w-100"
                                            onClick={() =>
                                                navigate(`/view-property/${item.property_id}`)
                                            }
                                        >
                                            <BsEye className="me-1" />
                                            View Details
                                        </Button>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* ==============================
            DELETE CONFIRMATION MODAL
        ============================== */}
                <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)} centered>
                    <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
                        Confirm Remove
                    </ModalHeader>
                    <ModalBody>
                        Are you sure you want to remove{" "}
                        <strong>{selectedProperty?.property_name}</strong> from favourites?
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="btn btn-primary"
                            onClick={() => setDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="btn btn-danger"
                            onClick={confirmRemoveFavourite}
                            disabled={removingId === selectedProperty?.property_id}
                        >
                            {removingId === selectedProperty?.property_id ? (
                                <Spinner size="sm" />
                            ) : (
                                "Yes, Remove"
                            )}
                        </Button>
                    </ModalFooter>
                </Modal>

            </Container>
        </section>
    );
};

export default Favourite;

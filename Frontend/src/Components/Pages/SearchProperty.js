import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, CardBody, Button, Input, Spinner, Offcanvas, OffcanvasHeader, OffcanvasBody,
} from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Handler from "../../Helpers/Handler";
import { BsGeoAlt, BsHouse, BsArrowsFullscreen, BsPeople, BsHeart, BsHeartFill, BsFilter, BsXCircle } from "react-icons/bs";
import { useAuth } from "../../Context/AuthenticateProvider";
import { useFavourite } from "../../Context/FavouriteProvider";
import styles from "../../style/SearchProperty.module.css";

const SearchProperty = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavourite();
  const { isAuthenticated } = useAuth();

  console.log(isAuthenticated, "User Authenticated?");

  // Separate state for form inputs (what user is currently selecting)
  const [formFilters, setFormFilters] = useState({
    search: queryParams.get("search") || "",
    type_id: queryParams.get("type_id") || "",
    category_id: queryParams.get("category_id") || "",
    page: Number(queryParams.get("page")) || 1,
    per_page: 20,
  });

  // State for actually applied filters (what's used to fetch data)
  const [appliedFilters, setAppliedFilters] = useState({
    search: queryParams.get("search") || "",
    type_id: queryParams.get("type_id") || "",
    category_id: queryParams.get("category_id") || "",
    page: Number(queryParams.get("page")) || 1,
    per_page: 20,
  });

  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false); // for mobile drawer

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const res = await Handler({
        method: "get",
        url: `/properties/search_prop.php?${params.toString()}`,
      });

      if (res.success) {
        setProperties(res.data || []);
        setTotalPages(res.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch only when appliedFilters changes (when Apply button is clicked)
  useEffect(() => {
    fetchProperties();
  }, [appliedFilters]);

  // Sync URL with applied filters
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate({ search: params.toString() }, { replace: true });
  }, [appliedFilters, navigate]);

  // Update form filters as user types (doesn't trigger search)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFormFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  // Apply filters only when button is clicked
  const applyFiltersAndClose = () => {
    setAppliedFilters({ ...formFilters, page: 1 }); // Reset to page 1 when applying new filters
    setFilterOpen(false); // close drawer on mobile
  };

  const toggleFav = async (property) => {
    await toggleFavorite(property);
  };

  const getCategoryName = (id) => {
    const cats = {
      1: "Home",
      2: "Land",
      3: "Plot",
      4: "Commercial",
      5: "Apartment",
      6: "Individual",
      7: "Villa",
    };
    return cats[id] || "Property";
  };

  const resetFilters = () => {
    const emptyFilters = {
      search: "",
      type_id: "",
      category_id: "",
      page: 1,
      per_page: 20,
    };
    setFormFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setFilterOpen(false);
  };

  // Clear individual filter
  const clearSearch = () => {
    setFormFilters(prev => ({ ...prev, search: "" }));
  };

  const clearCategory = () => {
    setFormFilters(prev => ({ ...prev, category_id: "" }));
  };

  const clearType = () => {
    setFormFilters(prev => ({ ...prev, type_id: "" }));
  };

  // Handle page change separately (should trigger immediately)
  const handlePageChange = (page) => {
    setAppliedFilters((prev) => ({ ...prev, page }));
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return appliedFilters.search || appliedFilters.category_id || appliedFilters.type_id;
  };

  const handleViewClick = async (propertyId) => {
    console.log(propertyId, "propertyId");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await Handler({
        method: "get",
        url: `/properties/view.php?property_id=${propertyId}`,
      });
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      if (res?.success) {
        navigate(`/user/view-property/${propertyId}`);
      }

    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className={`${styles.bgLightSoft} min-vh-100 py-4 py-lg-5`}>
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none text-primary fw-bold">Home</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Search Property</li>
          </ol>
        </nav>

        <Row>
          {/* Desktop Filters Sidebar */}
          <Col lg={3} className="d-none d-lg-block mb-4">
            <Card className="border-0 shadow-sm rounded-0 sticky-top" style={{ top: "80px" }}>
              <CardBody className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Filters</h5>
                  {hasActiveFilters() && (
                    <Button
                      color="link"
                      className="text-muted p-0 d-flex align-items-center gap-1 text-decoration-none"
                      onClick={resetFilters}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <BsXCircle size={16} /> Clear All
                    </Button>
                  )}
                </div>

                <div className="mb-3">
                  <label className={`${styles.smallLabel} mb-2`}>Keyword</label>
                  <div className="position-relative">
                    <Input
                      type="text"
                      name="search"
                      placeholder="City, Name..."
                      className={`${styles.premiumInput} pe-5`}
                      value={formFilters.search}
                      onChange={handleFilterChange}
                    />
                    {formFilters.search && (
                      <Button
                        color="link"
                        className={styles.clearButton}
                        onClick={clearSearch}
                      >
                        <BsXCircle size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className={`${styles.smallLabel} mb-2`}>Category</label>
                  <div className="position-relative">
                    <select
                      name="category_id"
                      className={`form-select ${styles.premiumSelect} pe-5`}
                      value={formFilters.category_id}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                      <option value="1">Home</option>
                      <option value="2">Land</option>
                      <option value="3">Plot</option>
                      <option value="4">Commercial Buildings</option>
                      <option value="5">Apartment</option>
                      <option value="6">Individual Home</option>
                      <option value="7">Villa</option>
                    </select>
                    {formFilters.category_id && (
                      <Button
                        color="link"
                        className={styles.clearButton}
                        onClick={clearCategory}
                      >
                        <BsXCircle size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className={`${styles.smallLabel} mb-2`}>Type</label>
                  <div className="position-relative">
                    <select
                      name="type_id"
                      className={`form-select ${styles.premiumSelect} pe-5`}
                      value={formFilters.type_id}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      <option value="1">For Buy</option>
                      <option value="2">For Rent</option>
                      <option value="3">Projects</option>
                      <option value="4">Commercial</option>
                    </select>
                    {formFilters.type_id && (
                      <Button
                        color="link"
                        className={styles.clearButton}
                        onClick={clearType}
                      >
                        <BsXCircle size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  className={`${styles.btnPremiumSolid} w-100 mt-3`}
                  onClick={applyFiltersAndClose}
                >
                  Apply Filters
                </Button>
              </CardBody>
            </Card>
          </Col>

          {/* Results Area */}
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <h4 className="fw-bold mb-0">Search Results</h4>
                {hasActiveFilters() && (
                  <Button
                    color="link"
                    className="text-muted d-none d-lg-inline-flex align-items-center gap-1 text-decoration-none"
                    onClick={resetFilters}
                    style={{ fontSize: "0.9rem" }}
                  >
                    <BsXCircle size={16} /> Clear Filters
                  </Button>
                )}
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">{properties.length} properties found</span>
                <Button
                  color="light"
                  className="d-lg-none p-2 shadow-sm"
                  onClick={() => setFilterOpen(true)}
                  style={{ width: "48px", height: "48px" }}
                >
                  <BsFilter size={24} />
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="d-flex flex-wrap gap-2 mb-4">
                {appliedFilters.search && (
                  <div className={styles.activeFilterBadge}>
                    <span>Search: {appliedFilters.search}</span>
                    <BsXCircle size={14} onClick={resetFilters} className="ms-2" style={{ cursor: "pointer" }} />
                  </div>
                )}
                {appliedFilters.category_id && (
                  <div className={styles.activeFilterBadge}>
                    <span>Category: {getCategoryName(appliedFilters.category_id)}</span>
                    <BsXCircle size={14} onClick={resetFilters} className="ms-2" style={{ cursor: "pointer" }} />
                  </div>
                )}
                {appliedFilters.type_id && (
                  <div className={styles.activeFilterBadge}>
                    <span>Type: {appliedFilters.type_id === "1" ? "For Buy" : appliedFilters.type_id === "2" ? "For Rent" : appliedFilters.type_id === "3" ? "Projects" : "Commercial"}</span>
                    <BsXCircle size={14} onClick={resetFilters} className="ms-2" style={{ cursor: "pointer" }} />
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className={`d-flex justify-content-center ${styles.py10}`}>
                <Spinner color="primary" />
              </div>
            ) : properties.length > 0 ? (
              <Row className="g-3">
                {properties?.map((p) => {
                  const isFav = isFavorite(p.property_id);
                  console.log(p, "p images");
                  return (
                    <Col md={6} lg={4} key={p.property_id}>
                      <Card className={`${styles.propertyCard} shadow-sm h-100 overflow-hidden border-0`}>
                        <div className="position-relative">
                          <img
                            // src={"http://localhost/your_backend_file/properties/" + p?.property_thumbnail}
                            className={`card-img-top ${styles.propertyThumb}`}
                            alt={p.property_name}
                          />
                          <div className={styles.propertyBadgeTop}>
                            {getCategoryName(p.category_id)}
                          </div>
                          <div className={styles.propertyPriceTag}>
                            ₹{Number(p.price || 0).toLocaleString()}
                          </div>
                        </div>
                        <CardBody className="p-3">
                          <h5 className="fw-bold text-truncate mb-2">{p.property_name}</h5>
                          <p className="text-muted small mb-3">
                            <BsGeoAlt className="text-primary me-1" /> {p.property_address}
                          </p>
                          <div className="d-flex justify-content-between border-top pt-3">
                            <div className="text-center">
                              <div className="small text-muted mb-1">
                                <BsHouse className="me-1" /> Beds
                              </div>
                              <span className="fw-bold">{p.beds || 0}</span>
                            </div>
                            <div className="text-center border-start border-end px-3">
                              <div className="small text-muted mb-1">
                                <BsArrowsFullscreen className="me-1" /> Sqft
                              </div>
                              <span className="fw-bold">{p.sqft || 0}</span>
                            </div>
                            <div className="text-center">
                              <div className="small text-muted mb-1">
                                <BsPeople className="me-1" /> Baths
                              </div>
                              <span className="fw-bold">{p.baths || 0}</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-4">
                            <Button size="sm" className={`${styles.btnPremiumOutline} flex-grow-1 d-flex align-items-center justify-content-center gap-2`} onClick={() => handleViewClick(p.property_id)} > View Details
                            </Button>
                            <Button
                              size="sm"
                              className={`${styles.btnFavorite} d-flex align-items-center justify-content-center ${isFav ? styles.active : ""}`}
                              onClick={() => toggleFav(p)}
                            >
                              {isFav ? <BsHeartFill size={18} /> : <BsHeart size={18} />}
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <div className={`text-center ${styles.py10} bg-white rounded-4 shadow-sm`}>
                <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                <h5 className="text-muted">No properties found matching your criteria.</h5>
                <Button className="btn-premium-link mt-3" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <ul className="pagination gap-2">
                  {[...Array(totalPages)].map((_, idx) => (
                    <li
                      key={idx}
                      className={`page-item ${appliedFilters.page === idx + 1 ? styles.pageItemActive : ""}`}
                    >
                      <button
                        className={styles.pageLink}
                        onClick={() => handlePageChange(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Mobile Bottom Drawer */}
      {/* Mobile Bottom Drawer - Fixed Content Visibility */}
      <Offcanvas
        isOpen={filterOpen}
        toggle={() => setFilterOpen(false)}
        direction="bottom"
        style={{ height: '70vh' }} // Machan, height-ah 70% set pannuna thaan ellam theriyum
      >
        <OffcanvasHeader toggle={() => setFilterOpen(false)} className="border-bottom">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="fw-bold mb-0">Filters</h5>
            {hasActiveFilters() && (
              <Button color="link" className="text-muted p-0 text-decoration-none" onClick={resetFilters}>
                <BsXCircle size={16} /> Clear All
              </Button>
            )}
          </div>
        </OffcanvasHeader>
        <OffcanvasBody className="p-4">
          <div className="mb-3">
            <label className="small fw-bold mb-2">Keyword</label>
            <Input
              type="text"
              name="search"
              placeholder="City, Name..."
              value={formFilters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="mb-3">
            <label className="small fw-bold mb-2">Category</label>
            <select
              name="category_id"
              className="form-select"
              value={formFilters.category_id}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="1">Home</option>
              <option value="2">Land</option>
              <option value="3">Plot</option>
              <option value="4">Commercial</option>
              <option value="5">Apartment</option>
              <option value="7">Villa</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="small fw-bold mb-2">Type</label>
            <select
              name="type_id"
              className="form-select"
              value={formFilters.type_id}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="1">For Buy</option>
              <option value="2">For Rent</option>
              <option value="3">Projects</option>
              <option value="4">Commercial</option>
            </select>
          </div>

          {/* Buttons wrapper without complex sticky logic */}
          <div className="mt-auto pt-3 border-top">
            <Button color="success" className="w-100 mb-2 py-3 fw-bold" onClick={applyFiltersAndClose}>
              Apply Filters
            </Button>
            <Button color="light" className="w-100" onClick={() => setFilterOpen(false)}>
              Close
            </Button>
          </div>
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
};

export default SearchProperty;
import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { IoClose } from "react-icons/io5";

// Reusable modal component
function CustomModal({ show, onHide, title, children, footer }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        {title && (
          <>
            <Modal.Title id="contained-modal-title-vcenter">
              {title}
            </Modal.Title>
            <button
              style={{
                background: "transparent",
                border: "none",
                padding: "4px",
              }}
              onClick={() => onHide(false)}
            >
              <IoClose size={24} />
            </button>
          </>
        )}
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      {/* <Modal.Footer>
        {footer ? (
          footer
        ) : (
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
        )}
      </Modal.Footer> */}
    </Modal>
  );
}

export default CustomModal;

import { useState } from "react";
import Modal from "../../../shared/components/Modal";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function ClientsPage() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button className="btn-primary" onClick={() => setIsOpen(true)}>
                Eliminar cliente
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Eliminar cliente"
                description="Esta acción no se puede deshacer."
                icon={faTrash}
                footer={
                    <>
                        <button className="btn-outline" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </button>
                        <button className="btn-primary">Eliminar</button>
                    </>
                }
            >
                Se eliminará el cliente y su historial de pedidos.
            </Modal>
        </>
    );
}
import os
import sys
import random
from datetime import datetime, timedelta, date

# Add parent directory to path so app modules can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import (
    User,
    Cliente,
    Contacto,
    Fabricante,
    Producto,
    Oportunidad,
    OportunidadProducto,
    Actividad,
    Nota,
)
from app.security import get_password_hash


def run_seed():
    print("Connecting to database for seeding...")
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if users table already has data
        user_count = db.query(User).count()
        if user_count > 0:
            print(f"Database already contains {user_count} users. Skipping seed.")
            return

        print("Seeding database with synthetic TechDist CRM data...")

        # 1. USERS (6)
        default_pwd = get_password_hash("Techdist2025!")
        users_data = [
            {"nombre": "Admin", "email": "admin@techdist.mx", "rol": "admin"},
            {"nombre": "Juan García", "email": "juan.garcia@techdist.mx", "rol": "vendedor"},
            {"nombre": "María López", "email": "maria.lopez@techdist.mx", "rol": "vendedor"},
            {"nombre": "Carlos Reyes", "email": "carlos.reyes@techdist.mx", "rol": "vendedor"},
            {"nombre": "Ana Torres", "email": "ana.torres@techdist.mx", "rol": "vendedor"},
            {"nombre": "Director Comercial", "email": "director@techdist.mx", "rol": "viewer"},
        ]

        users = []
        for u in users_data:
            user = User(
                nombre=u["nombre"],
                email=u["email"],
                password_hash=default_pwd,
                rol=u["rol"],
                activo=True,
            )
            db.add(user)
            users.append(user)
        db.commit()
        for u in users:
            db.refresh(u)
        print(f"-> Created {len(users)} users")

        vendedores = [u for u in users if u.rol == "vendedor"]

        # 2. FABRICANTES (8)
        fabs_data = [
            {"nombre": "Cisco Systems", "categoria": "networking", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg"},
            {"nombre": "HP Enterprise", "categoria": "compute", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/4/46/Hewlett_Packard_Enterprise_logo.svg"},
            {"nombre": "Dell Technologies", "categoria": "storage", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg"},
            {"nombre": "Microsoft", "categoria": "software", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"},
            {"nombre": "Fortinet", "categoria": "security", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/6/67/Fortinet_logo.svg"},
            {"nombre": "Veeam Software", "categoria": "software", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Veeam_logo.svg"},
            {"nombre": "VMware (Broadcom)", "categoria": "cloud", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Vmware.svg"},
            {"nombre": "Aruba Networks (HPE)", "categoria": "networking", "logo_url": "https://upload.wikimedia.org/wikipedia/commons/4/42/Aruba_Networks_Logo.svg"},
        ]

        fabricantes = []
        for f in fabs_data:
            fab = Fabricante(
                nombre=f["nombre"],
                categoria=f["categoria"],
                logo_url=f["logo_url"],
                activo=True,
            )
            db.add(fab)
            fabricantes.append(fab)
        db.commit()
        for f in fabricantes:
            db.refresh(f)
        print(f"-> Created {len(fabricantes)} fabricantes")

        # 3. PRODUCTOS (16 - 2 per fabricante)
        prods_data = [
            # Cisco
            {"fab": "Cisco Systems", "nombre": "Switch Catalyst 9300 48P PoE+", "cat": "networking", "precio": 4500.0, "sku": "C9300-48P-A", "desc": "Switch de capa 3 empresarial para campus"},
            {"fab": "Cisco Systems", "nombre": "Next-Gen Firewall Firepower 1010", "cat": "security", "precio": 1800.0, "sku": "FPR1010-NGFW-K9", "desc": "Firewall de próxima generación para sucursales"},
            # HPE
            {"fab": "HP Enterprise", "nombre": "Servidor ProLiant DL380 Gen10 Plus", "cat": "compute", "precio": 8200.0, "sku": "P56961-B21", "desc": "Servidor 2U de alto rendimiento para virtualización"},
            {"fab": "HP Enterprise", "nombre": "Sistema de Backup StoreOnce 3620", "cat": "storage", "precio": 14500.0, "sku": "BB954A", "desc": "Appliance de almacenamiento con deduplicación avanzada"},
            # Dell
            {"fab": "Dell Technologies", "nombre": "Servidor PowerEdge R750 2x Xeon", "cat": "compute", "precio": 7800.0, "sku": "PE-R750-01", "desc": "Servidor en rack de 2 sockets escalable"},
            {"fab": "Dell Technologies", "nombre": "Storage All-Flash PowerStore 500T", "cat": "storage", "precio": 28000.0, "sku": "PSTORE-500T", "desc": "Arreglo de almacenamiento unificado NVMe"},
            # Microsoft
            {"fab": "Microsoft", "nombre": "Licenciamiento Microsoft 365 E5 Anual", "cat": "software", "precio": 450.0, "sku": "M365-E5-SUB", "desc": "Suite de productividad y seguridad empresarial"},
            {"fab": "Microsoft", "nombre": "Paquete Azure Enterprise Cloud Credits", "cat": "cloud", "precio": 100000.0, "sku": "AZ-ENT-100K", "desc": "Créditos para infraestructura y cómputo en la nube"},
            # Fortinet
            {"fab": "Fortinet", "nombre": "Firewall FortiGate 100F Enterprise", "cat": "security", "precio": 3200.0, "sku": "FG-100F-BDL", "desc": "Seguridad perimetral y SD-WAN integrada"},
            {"fab": "Fortinet", "nombre": "Centralizador FortiAnalyzer 300F", "cat": "security", "precio": 6500.0, "sku": "FAZ-300F", "desc": "Analítica y correlación de eventos de seguridad"},
            # Veeam
            {"fab": "Veeam Software", "nombre": "Veeam Backup & Replication Enterprise Plus", "cat": "software", "precio": 1200.0, "sku": "V-VBRSTE-VS-P0000-00", "desc": "Respaldo y recuperación de desastres híbrida"},
            {"fab": "Veeam Software", "nombre": "Veeam Data Platform Advanced Edition", "cat": "software", "precio": 4800.0, "sku": "V-DATA-ADV-100", "desc": "Suite completa de protección contra ransomware"},
            # VMware
            {"fab": "VMware (Broadcom)", "nombre": "VMware Cloud Foundation Suscripción", "cat": "cloud", "precio": 35000.0, "sku": "VCF-ENT-SUB", "desc": "Plataforma de nube híbrida unificada"},
            {"fab": "VMware (Broadcom)", "nombre": "vSphere Enterprise Plus 32 Core Pack", "cat": "software", "precio": 5400.0, "sku": "VS-ENT-PL-32C", "desc": "Virtualización de servidores de misión crítica"},
            # Aruba
            {"fab": "Aruba Networks (HPE)", "nombre": "Switch de Acceso Aruba CX 6200F 48G", "cat": "networking", "precio": 3100.0, "sku": "JL726A", "desc": "Switch apilable con telemetría en tiempo real"},
            {"fab": "Aruba Networks (HPE)", "nombre": "Access Point Aruba AP-515 Wi-Fi 6", "cat": "networking", "precio": 750.0, "sku": "Q9H62A", "desc": "Punto de acceso de alta densidad para oficinas"},
        ]

        fab_map = {f.nombre: f.id for f in fabricantes}
        productos = []
        for p in prods_data:
            prod = Producto(
                fabricante_id=fab_map[p["fab"]],
                nombre=p["nombre"],
                categoria=p["cat"],
                precio_lista_usd=p["precio"],
                sku=p["sku"],
                descripcion=p["desc"],
                activo=True,
            )
            db.add(prod)
            productos.append(prod)
        db.commit()
        for p in productos:
            db.refresh(p)
        print(f"-> Created {len(productos)} productos")

        # 4. CLIENTES (15: 5 SMB, 6 Mid-Market, 4 Enterprise)
        clientes_data = [
            # SMB (5)
            {"nombre": "Consultoría IT Vanguardia", "ind": "Servicios TI", "emp": 45, "cd": "CDMX", "seg": "SMB", "web": "https://itvanguardia.com.mx"},
            {"nombre": "Distribuidora Médica del Bajío", "ind": "Salud", "emp": 80, "cd": "Querétaro", "seg": "SMB", "web": "https://medbajio.mx"},
            {"nombre": "Logística y Envíos Express Monterrey", "ind": "Transporte", "emp": 120, "cd": "Monterrey", "seg": "SMB", "web": "https://expressmty.com"},
            {"nombre": "Grupo Hotelero Colonial", "ind": "Hospitalidad", "emp": 95, "cd": "Puebla", "seg": "SMB", "web": "https://colonialhoteles.mx"},
            {"nombre": "Agroinsumos del Occidente", "ind": "Agroindustria", "emp": 60, "cd": "Guadalajara", "seg": "SMB", "web": "https://agrooccidente.mx"},
            # Mid-Market (6)
            {"nombre": "Manufacturas de Precisión Querétaro", "ind": "Manufactura", "emp": 450, "cd": "Querétaro", "seg": "Mid-Market", "web": "https://manufprecision.mx"},
            {"nombre": "Cadena de Tiendas Al Super Express", "ind": "Retail", "emp": 850, "cd": "Monterrey", "seg": "Mid-Market", "web": "https://alsuperexpress.com.mx"},
            {"nombre": "Financiera Popular de México", "ind": "Financiero", "emp": 600, "cd": "CDMX", "seg": "Mid-Market", "web": "https://finpopular.com.mx"},
            {"nombre": "Hospital Metropolitano de Jalisco", "ind": "Salud", "emp": 750, "cd": "Guadalajara", "seg": "Mid-Market", "web": "https://hospmetropolitano.org.mx"},
            {"nombre": "Universidad Tecnológica Central", "ind": "Educación", "emp": 900, "cd": "Puebla", "seg": "Mid-Market", "web": "https://utcentral.edu.mx"},
            {"nombre": "Alimentos Procesados Santa María", "ind": "Manufactura", "emp": 520, "cd": "Guadalajara", "seg": "Mid-Market", "web": "https://alimentos-santamaria.mx"},
            # Enterprise (4)
            {"nombre": "Banco Intercontinental de México", "ind": "Financiero", "emp": 4500, "cd": "CDMX", "seg": "Enterprise", "web": "https://interbanc.com.mx"},
            {"nombre": "Secretaría de Finanzas y Administración Estatal", "ind": "Gobierno", "emp": 6200, "cd": "Puebla", "seg": "Enterprise", "web": "https://finanzas.gob.mx"},
            {"nombre": "Consorcio Industrial del Norte", "ind": "Manufactura", "emp": 8500, "cd": "Monterrey", "seg": "Enterprise", "web": "https://cinorte.com.mx"},
            {"nombre": "Corporativo Retail Nacional", "ind": "Retail", "emp": 12000, "cd": "CDMX", "seg": "Enterprise", "web": "https://corp-retail.mx"},
        ]

        clientes = []
        for c in clientes_data:
            cli = Cliente(
                nombre=c["nombre"],
                industria=c["ind"],
                num_empleados=c["emp"],
                ciudad=c["cd"],
                pais="México",
                segmento=c["seg"],
                website=c["web"],
                activo=True,
            )
            db.add(cli)
            clientes.append(cli)
        db.commit()
        for c in clientes:
            db.refresh(c)
        print(f"-> Created {len(clientes)} clientes")

        # 5. CONTACTOS (30 - 2 per cliente)
        first_names = ["Alejandro", "Sofía", "Roberto", "Valeria", "Fernando", "Gabriela", "Mauricio", "Patricia", "Ricardo", "Daniela", "Eduardo", "Adriana", "Jorge", "Lucía", "Guillermo"]
        last_names = ["Morales", "Hernández", "Castillo", "Vargas", "Mendoza", "Navarro", "Sánchez", "Guzmán", "Pérez", "Ramos", "Ortiz", "Salazar", "Reyes", "Domínguez", "Cruz"]
        roles_cargos = [
            ("Director de TI", True),
            ("Gerente de Compras", False),
            ("Chief Technology Officer (CTO)", True),
            ("Subdirector de Infraestructura", False),
            ("Director General (CEO)", True),
            ("Jefe de Seguridad de la Información (CISO)", True),
        ]

        contactos = []
        for i, cli in enumerate(clientes):
            # Contact 1 (Decision Maker)
            fn1 = first_names[(i * 2) % len(first_names)]
            ln1 = last_names[(i * 2) % len(last_names)]
            cargo1, is_dm1 = roles_cargos[(i * 2) % len(roles_cargos)]
            c1 = Contacto(
                cliente_id=cli.id,
                nombre=fn1,
                apellido=ln1,
                cargo=cargo1,
                email=f"{fn1.lower()}.{ln1.lower()}@{cli.nombre.split()[0].lower()}.com.mx",
                telefono=f"+52 55 {random.randint(1000, 9999)} {random.randint(1000, 9999)}",
                es_decision_maker=True,
                activo=True,
            )
            db.add(c1)
            contactos.append(c1)

            # Contact 2
            fn2 = first_names[(i * 2 + 1) % len(first_names)]
            ln2 = last_names[(i * 2 + 1) % len(last_names)]
            cargo2, _ = roles_cargos[(i * 2 + 1) % len(roles_cargos)]
            c2 = Contacto(
                cliente_id=cli.id,
                nombre=fn2,
                apellido=ln2,
                cargo=cargo2,
                email=f"{fn2.lower()}.{ln2.lower()}@{cli.nombre.split()[0].lower()}.com.mx",
                telefono=f"+52 81 {random.randint(1000, 9999)} {random.randint(1000, 9999)}",
                es_decision_maker=False,
                activo=True,
            )
            db.add(c2)
            contactos.append(c2)

        db.commit()
        for c in contactos:
            db.refresh(c)
        print(f"-> Created {len(contactos)} contactos")

        # 6. OPORTUNIDADES (40)
        # Stage distribution:
        # - prospeccion: 8
        # - calificacion: 8
        # - propuesta_tecnica: 7
        # - propuesta_comercial: 6
        # - negociacion: 5
        # - ganado: 4 (within last 60 days)
        # - perdido: 2 (motivo_perdida: "precio" or "competidor")
        stages_plan = (
            ["prospeccion"] * 8
            + ["calificacion"] * 8
            + ["propuesta_tecnica"] * 7
            + ["propuesta_comercial"] * 6
            + ["negociacion"] * 5
            + ["ganado"] * 4
            + ["perdido"] * 2
        )

        opp_titles = [
            "Renovación de Infraestructura de Datacenter",
            "Implementación de Core de Red y Switching Campus",
            "Migración de Servicios Críticos a Nube Híbrida",
            "Solución de Seguridad Perimetral y SD-WAN",
            "Modernización de Almacenamiento All-Flash NVMe",
            "Consolidación de Servidores para Virtualización",
            "Esquema de Respaldo Inmutable Anti-Ransomware",
            "Despliegue de Red Inalámbrica Wi-Fi 6 de Alta Densidad",
            "Licenciamiento Corporativo y Protección Endpoint",
            "Actualización Tecnológica de Nodos de Cómputo",
            "Ampliación de Capacidad Storage para Analytics",
            "Reemplazo de Firewalls Sucursales y VPNs",
            "Plataforma de Orquestación y Virtualización VCF",
            "Monitoreo y Correlación de Eventos SIEM/SOC",
            "Optimización de Red de Área de Almacenamiento (SAN)",
            "Renovación de Soporte y Suscripciones Cloud",
            "Infraestructura Convergente para ERP SAP HANA",
            "Seguridad de Redes Industriales y Microsegmentación",
            "Continuidad de Negocio y Sitio de Recuperación DR",
            "Equipamiento de Switches de Distribución 10G/40G",
            "Contrato Marco de Licenciamiento Microsoft Enterprise",
            "Appliance de Deduplicación y Retención Prolongada",
            "Migración de Correo y Colaboración a M365",
            "Protección de Base de Datos y Cifrado de Información",
            "Implementación de Red SD-Branch para 25 Sucursales",
            "Granja de Servidores para Virtual Desktop (VDI)",
            "Almacenamiento Secundario y Copia en Nube",
            "Plataforma de Segmentación Zero-Trust",
            "Renovación de Access Points en Corporativo y Planta",
            "Suscripción de Cómputo Elástico en Azure",
            "Consolidación de Plataforma de Virtualización vSphere",
            "Suministro de Servidores de Alta Disponibilidad",
            "Appliance de Seguridad FortiGate con Filtro Web",
            "Ampliación de Licencias de Backup para VMs",
            "Modernización de Switch Top of Rack Datacenter",
            "Estrategia Integral de Respaldo y Protección Cloud",
            "Plataforma de Analítica de Red y Telemetría Centralizada",
            "Cluster de Almacenamiento Distribuido para Big Data",
            "Solución de Prevención de Fuga de Datos (DLP)",
            "Migración Integral de Datacenter Físico a Virtual",
        ]

        origins = ["referido", "outbound", "inbound", "renovacion", "otro"]
        priorities = ["alta", "media", "baja"]

        today = date.today()
        now = datetime.utcnow()
        oportunidades = []

        for idx, stage in enumerate(stages_plan):
            cli = clientes[idx % len(clientes)]
            cli_contactos = [ct for ct in contactos if ct.cliente_id == cli.id]
            contacto = cli_contactos[0] if cli_contactos else None
            vendedor = vendedores[idx % len(vendedores)]

            # Values between $15,000 and $850,000 USD
            if cli.segmento == "Enterprise":
                valor = round(random.uniform(150000, 850000), 2)
            elif cli.segmento == "Mid-Market":
                valor = round(random.uniform(50000, 250000), 2)
            else:
                valor = round(random.uniform(15000, 65000), 2)

            # Dates & stage logic
            created_days_ago = random.randint(10, 180)
            created_dt = now - timedelta(days=created_days_ago)

            motivo = None
            if stage == "ganado":
                prob = 100.0
                closed_days_ago = random.randint(5, 55)
                close_dt = today - timedelta(days=closed_days_ago)
                updated_dt = created_dt + timedelta(days=min(created_days_ago - 2, 45))
            elif stage == "perdido":
                prob = 0.0
                motivo = "precio" if idx % 2 == 0 else "competidor"
                close_dt = today - timedelta(days=random.randint(5, 40))
                updated_dt = created_dt + timedelta(days=min(created_days_ago - 2, 30))
            else:
                # Open deal
                stage_prob_map = {
                    "prospeccion": 10.0,
                    "calificacion": 25.0,
                    "propuesta_tecnica": 50.0,
                    "propuesta_comercial": 70.0,
                    "negociacion": 85.0,
                }
                prob = stage_prob_map.get(stage, 20.0)
                future_days = random.randint(30, 90)
                close_dt = today + timedelta(days=future_days)
                updated_dt = created_dt + timedelta(days=random.randint(1, max(1, created_days_ago - 1)))

            opp = Oportunidad(
                nombre=f"{opp_titles[idx]} - {cli.nombre.split()[0]}",
                cliente_id=cli.id,
                propietario_id=vendedor.id,
                contacto_principal_id=contacto.id if contacto else None,
                etapa=stage,
                valor_estimado_usd=valor,
                probabilidad=prob,
                fecha_cierre_estimada=close_dt,
                descripcion=f"Oportunidad comercial para {cli.nombre} enfocada en {opp_titles[idx].lower()}.",
                origen=origins[idx % len(origins)],
                prioridad=priorities[idx % len(priorities)],
                motivo_perdida=motivo,
                created_at=created_dt,
                updated_at=updated_dt,
            )
            db.add(opp)
            oportunidades.append(opp)

        db.commit()
        for o in oportunidades:
            db.refresh(o)
        print(f"-> Created {len(oportunidades)} oportunidades")

        # 7. OPORTUNIDAD_PRODUCTOS (Link 1-3 products per opportunity)
        for opp in oportunidades:
            num_prods = random.randint(1, 3)
            sampled_prods = random.sample(productos, num_prods)
            for prod in sampled_prods:
                op_p = OportunidadProducto(
                    oportunidad_id=opp.id,
                    producto_id=prod.id,
                    cantidad=random.randint(1, 5),
                    precio_unitario_usd=prod.precio_lista_usd,
                )
                db.add(op_p)
        db.commit()

        # 8. ACTIVIDADES (80 - at least 2 per active opportunity)
        activity_types = ["llamada", "reunion", "email", "demo", "propuesta", "seguimiento"]
        activity_titles = [
            ("llamada", "Llamada de prospección inicial"),
            ("reunion", "Reunión de levantamiento de requerimientos"),
            ("demo", "Sesión de demostración de producto en laboratorio"),
            ("propuesta", "Envío formal de propuesta técnico-económica"),
            ("reunion", "Revisión de alcances con Dirección de TI"),
            ("seguimiento", "Llamada de seguimiento a cotización enviada"),
            ("email", "Envío de documentación técnica y datasheets"),
            ("reunion", "Negociación de términos de pago y entrega"),
        ]

        active_opps = [o for o in oportunidades if o.etapa not in ["ganado", "perdido"]]
        actividades_created = 0

        # Ensure at least 2 per active opportunity (34 active * 2 = 68 activities)
        for opp in active_opps:
            for act_num in range(2):
                act_type, title_template = activity_titles[(actividades_created + act_num) % len(activity_titles)]
                days_offset = random.randint(1, 45)
                act_dt = now - timedelta(days=days_offset)
                act = Actividad(
                    oportunidad_id=opp.id,
                    usuario_id=opp.propietario_id,
                    tipo=act_type,
                    titulo=f"{title_template} - {opp.cliente.nombre.split()[0]}",
                    descripcion=f"Actividad realizada con el equipo de TI para avanzar la oportunidad {opp.nombre}.",
                    fecha=act_dt,
                    duracion_min=random.choice([15, 30, 45, 60, 90]),
                    resultado="Cliente mostró alto interés. Se acordó siguiente paso.",
                    created_at=act_dt,
                )
                db.add(act)
                actividades_created += 1

        # Add remaining activities to reach 80 total
        for opp in oportunidades[:(80 - actividades_created)]:
            act_type, title_template = activity_titles[actividades_created % len(activity_titles)]
            days_offset = random.randint(1, 20)
            act_dt = now - timedelta(days=days_offset)
            act = Actividad(
                oportunidad_id=opp.id,
                usuario_id=opp.propietario_id,
                tipo=act_type,
                titulo=f"{title_template} - {opp.cliente.nombre.split()[0]}",
                descripcion=f"Seguimiento ejecutivo de la cuenta {opp.cliente.nombre}.",
                fecha=act_dt,
                duracion_min=30,
                resultado="Favorable. Avance conforme al cronograma.",
                created_at=act_dt,
            )
            db.add(act)
            actividades_created += 1

        db.commit()
        print(f"-> Created {actividades_created} actividades")

        # 9. NOTAS (40 - at least 1 per active opportunity)
        note_texts = [
            "El cliente solicitó descuento adicional del 5% por pronto pago en caso de cerrar este trimestre.",
            "El CTO confirmó que cuentan con presupuesto asignado dentro del ejercicio fiscal actual.",
            "Requieren que la entrega física se realice en dos etapas: CDMX y planta Monterrey.",
            "Se validó compatibilidad con la infraestructura de virtualización existente.",
            "El tomador de decisión solicitó 2 referencias de clientes del mismo sector.",
            "Validar disponibilidad de stock con mayorista antes de confirmar fecha de entrega.",
            "El área de compras requiere registro como proveedor previo a la emisión de orden de compra.",
            "Se programó sesión de dudas técnicas con el arquitecto del fabricante.",
        ]

        notas_created = 0
        for opp in active_opps:
            nota = Nota(
                oportunidad_id=opp.id,
                usuario_id=opp.propietario_id,
                contenido=f"{note_texts[notas_created % len(note_texts)]} (Ref: {opp.nombre})",
                created_at=now - timedelta(days=random.randint(1, 30)),
            )
            db.add(nota)
            notas_created += 1

        # Add remaining to reach 40
        for opp in oportunidades[:(40 - notas_created)]:
            nota = Nota(
                oportunidad_id=opp.id,
                usuario_id=opp.propietario_id,
                contenido=f"Nota de seguimiento: {note_texts[notas_created % len(note_texts)]}",
                created_at=now - timedelta(days=random.randint(1, 20)),
            )
            db.add(nota)
            notas_created += 1

        db.commit()
        print(f"-> Created {notas_created} notas")

        print("=== Database seeding completed successfully! ===")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()

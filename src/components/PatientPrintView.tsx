interface PatientPrintViewProps {
  patient: any;
  examination: any;
  diagnosis: any;
}

export function PatientPrintView({ patient, examination, diagnosis }: PatientPrintViewProps) {
  return (
    <div className="print-only p-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">VBE Eye Center Corp</h1>
          <p className="text-sm text-gray-600">Patient Summary Report</p>
        </div>

        {/* Patient Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b-2 border-gray-800 mb-3">
            Patient Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">
                <span className="font-semibold">Patient ID:</span> {patient.patient_id}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Name:</span> {patient.lastname}, {patient.firstname}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date of Birth:</span> {patient.birthdate}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Gender:</span> {patient.gender}
              </p>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-semibold">Contact:</span> {patient.contact_number || 'N/A'}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Address:</span> {patient.address || 'N/A'}
              </p>
              <p className="text-sm">
                <span className="font-semibold">PhilHealth:</span>{' '}
                {patient.philhealth_member ? patient.philhealth_no : 'Not a member'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Examination */}
        {examination && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold border-b-2 border-gray-800 mb-3">
              Recent Examination
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold mb-1">OD (Right Eye)</p>
                <p className="text-sm">VA: {examination.va_od || 'N/A'}</p>
                <p className="text-sm">Biometry K1: {examination.biometry_od_k1 || 'N/A'}</p>
                <p className="text-sm">Biometry K2: {examination.biometry_od_k2 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">OS (Left Eye)</p>
                <p className="text-sm">VA: {examination.va_os || 'N/A'}</p>
                <p className="text-sm">Biometry K1: {examination.biometry_os_k1 || 'N/A'}</p>
                <p className="text-sm">Biometry K2: {examination.biometry_os_k2 || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis */}
        {diagnosis && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold border-b-2 border-gray-800 mb-3">Diagnosis</h2>
            <div className="space-y-2">
              {diagnosis.cataract && (
                <p className="text-sm">
                  • Cataract ({diagnosis.cataract_type}) - {diagnosis.cataract_laterality}
                </p>
              )}
              {diagnosis.pseudophakia && (
                <p className="text-sm">
                  • Pseudophakia - {diagnosis.pseudophakia_laterality}
                </p>
              )}
              {diagnosis.pterygium && (
                <p className="text-sm">
                  • Pterygium - {diagnosis.pterygium_laterality}
                </p>
              )}
              {diagnosis.refraction_error && (
                <p className="text-sm">
                  • Refraction Error - {diagnosis.refraction_laterality}
                </p>
              )}
              {diagnosis.other_diagnosis && (
                <p className="text-sm">
                  • {diagnosis.other_diagnosis} - {diagnosis.other_laterality}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

<script setup lang="ts">
import type { SignatureInfo } from '../pdf-signature-checker.types';

const props = defineProps<{ signature: SignatureInfo }>();

const { t } = useI18n();

const { signature } = toRefs(props);

const tableHeaders = computed(() => ({
  validityPeriod: t('tools.pdf-signature-checker.validityPeriod'),
  issuedBy: t('tools.pdf-signature-checker.issuedBy'),
  issuedTo: t('tools.pdf-signature-checker.issuedTo'),
  pemCertificate: t('tools.pdf-signature-checker.pemCertificate'),
}));

type CertificateRow = SignatureInfo['meta']['certs'][number] & {
  validityPeriod: {
    notBefore: string
    notAfter: string
  }
  certificateName: string
};

const certs = computed<CertificateRow[]>(() => signature.value.meta.certs.map((certificate, index) => ({
  ...certificate,
  validityPeriod: {
    notBefore: new Date(certificate.validityPeriod.notBefore).toLocaleString(),
    notAfter: new Date(certificate.validityPeriod.notAfter).toLocaleString(),
  },
  certificateName: t('tools.pdf-signature-checker.certificateName', { index: index + 1 }),
})),
);

const asValidityPeriod = (value: unknown) => value as CertificateRow['validityPeriod'];
const asIssuedBy = (value: unknown) => value as CertificateRow['issuedBy'];
const asIssuedTo = (value: unknown) => value as CertificateRow['issuedTo'];
const asPem = (value: unknown) => value as CertificateRow['pemCertificate'];
</script>

<template>
  <div flex flex-col gap-2>
    <c-table :data="certs" :headers="tableHeaders">
      <template #validityPeriod="{ value }">
        <c-key-value-list
          :items="[{
            label: $t('tools.pdf-signature-checker.notBefore'),
            value: asValidityPeriod(value).notBefore,
          }, {
            label: $t('tools.pdf-signature-checker.notAfter'),
            value: asValidityPeriod(value).notAfter,
          }]"
        />
      </template>

      <template #issuedBy="{ value }">
        <c-key-value-list
          :items="[{
            label: $t('tools.pdf-signature-checker.commonName'),
            value: asIssuedBy(value).commonName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationName'),
            value: asIssuedBy(value).organizationName,
          }, {
            label: $t('tools.pdf-signature-checker.countryName'),
            value: asIssuedBy(value).countryName,
          }, {
            label: $t('tools.pdf-signature-checker.localityName'),
            value: asIssuedBy(value).localityName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationalUnitName'),
            value: asIssuedBy(value).organizationalUnitName,
          }, {
            label: $t('tools.pdf-signature-checker.stateOrProvinceName'),
            value: asIssuedBy(value).stateOrProvinceName,
          }]"
        />
      </template>

      <template #issuedTo="{ value }">
        <c-key-value-list
          :items="[{
            label: $t('tools.pdf-signature-checker.commonName'),
            value: asIssuedTo(value).commonName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationName'),
            value: asIssuedTo(value).organizationName,
          }, {
            label: $t('tools.pdf-signature-checker.countryName'),
            value: asIssuedTo(value).countryName,
          }, {
            label: $t('tools.pdf-signature-checker.localityName'),
            value: asIssuedTo(value).localityName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationalUnitName'),
            value: asIssuedTo(value).organizationalUnitName,
          }, {
            label: $t('tools.pdf-signature-checker.stateOrProvinceName'),
            value: asIssuedTo(value).stateOrProvinceName,
          }]"
        />
      </template>

      <template #pemCertificate="{ value }">
        <c-modal-value :value="asPem(value)" :label="$t('tools.pdf-signature-checker.viewPemCert')">
          <template #value>
            <div break-all text-xs>
              {{ asPem(value) }}
            </div>
          </template>
        </c-modal-value>
      </template>
    </c-table>
  </div>
</template>

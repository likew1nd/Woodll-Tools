<script setup lang="ts">
import type { SignatureInfo } from '../pdf-signature-checker.types';

const { t } = useI18n();

const props = defineProps<{ signature: SignatureInfo }>();
const { signature } = toRefs(props);

const tableHeaders = computed(() => ({
  validityPeriod: t('tools.pdf-signature-checker.validityPeriod'),
  issuedBy: t('tools.pdf-signature-checker.issuedBy'),
  issuedTo: t('tools.pdf-signature-checker.issuedTo'),
  pemCertificate: t('tools.pdf-signature-checker.pemCertificate'),
}));

const certs = computed(() => signature.value.meta.certs.map((certificate, index) => ({
  ...certificate,
  validityPeriod: {
    notBefore: new Date(certificate.validityPeriod.notBefore).toLocaleString(),
    notAfter: new Date(certificate.validityPeriod.notAfter).toLocaleString(),
  },
  certificateName: t('tools.pdf-signature-checker.certificateName', { index: index + 1 }),
})),
);
</script>

<template>
  <div flex flex-col gap-2>
    <c-table :data="certs" :headers="tableHeaders">
      <template #validityPeriod="{ value }">
        <c-key-value-list
          :items="[{
            label: $t('tools.pdf-signature-checker.notBefore'),
            value: value.notBefore,
          }, {
            label: $t('tools.pdf-signature-checker.notAfter'),
            value: value.notAfter,
          }]"
        />
      </template>

      <template #issuedBy="{ value }">
        <c-key-value-list
          :items="[{
            label: $t('tools.pdf-signature-checker.commonName'),
            value: value.commonName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationName'),
            value: value.organizationName,
          }, {
            label: $t('tools.pdf-signature-checker.countryName'),
            value: value.countryName,
          }, {
            label: $t('tools.pdf-signature-checker.localityName'),
            value: value.localityName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationalUnitName'),
            value: value.organizationalUnitName,
          }, {
            label: $t('tools.pdf-signature-checker.stateOrProvinceName'),
            value: value.stateOrProvinceName,
          }]"
        />
      </template>

      <template #issuedTo="{ value }">
        <c-key-value-list
          :items="[{
            label: $t('tools.pdf-signature-checker.commonName'),
            value: value.commonName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationName'),
            value: value.organizationName,
          }, {
            label: $t('tools.pdf-signature-checker.countryName'),
            value: value.countryName,
          }, {
            label: $t('tools.pdf-signature-checker.localityName'),
            value: value.localityName,
          }, {
            label: $t('tools.pdf-signature-checker.organizationalUnitName'),
            value: value.organizationalUnitName,
          }, {
            label: $t('tools.pdf-signature-checker.stateOrProvinceName'),
            value: value.stateOrProvinceName,
          }]"
        />
      </template>

      <template #pemCertificate="{ value }">
        <c-modal-value :value="value" :label="$t('tools.pdf-signature-checker.viewPemCert')">
          <template #value>
            <div break-all text-xs>
              {{ value }}
            </div>
          </template>
        </c-modal-value>
      </template>
    </c-table>
  </div>
</template>
